import { describe, it, expect, beforeEach } from 'vitest';
import {
  addProductItem,
  updateProductItem,
  removeProductItem,
  toggleItemUnavailable,
  getOrderItems,
} from './itemService';
import { createGroupOrder, getOrderById } from './orderService';
import { PILOT_HOSTEL } from '../utils/constants';

describe('Item Service (Phase 4)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a manual item and recalculates subtotal in integer paise', async () => {
    const order = await createGroupOrder({
      title: 'Snack Order',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    const item = await addProductItem(order.id, 'u1', 'Ajay', {
      entryType: 'manual',
      productName: 'Amul Taaza Milk 1L',
      quantity: 2,
      unitPriceRupees: 54,
      note: 'Chilled',
    });

    expect(item.id).toBeDefined();
    expect(item.productName).toBe('Amul Taaza Milk 1L');
    expect(item.quantity).toBe(2);
    expect(item.unitPricePaise).toBe(5400);
    expect(item.subtotalPaise).toBe(10800); // 2 * 54 = 10800 paise

    // Verify order subtotal was updated
    const updatedOrder = await getOrderById(order.id);
    expect(updatedOrder?.groupItemSubtotalPaise).toBe(10800);
    expect(updatedOrder?.status).toBe('OPEN'); // 108 < 199
  });

  it('adds a URL-based item with platform allowlist validation', async () => {
    const order = await createGroupOrder({
      title: 'Blinkit Essentials',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    // Valid Blinkit link
    const item = await addProductItem(order.id, 'u1', 'Ajay', {
      entryType: 'url',
      productURL: 'https://blinkit.com/prn/bread-wholewheat/prid/99',
      productName: 'Whole Wheat Bread',
      quantity: 1,
      unitPriceRupees: 45,
    });

    expect(item.entryType).toBe('url');
    expect(item.productURL).toContain('blinkit.com');
    expect(item.subtotalPaise).toBe(4500);

    // Cross-platform URL should be rejected
    await expect(
      addProductItem(order.id, 'u1', 'Ajay', {
        entryType: 'url',
        productURL: 'https://www.zeptonow.com/product/1234',
        productName: 'Zepto Item on Blinkit Order',
        quantity: 1,
        unitPriceRupees: 50,
      })
    ).rejects.toThrow(/Link must be from Blinkit/);
  });

  it('transitions order status to THRESHOLD_REACHED when items meet target', async () => {
    const order = await createGroupOrder({
      title: 'Target Test Order',
      platform: 'zepto',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 149, // ₹149 target (14900 paise)
      durationMinutes: 30,
    });

    // Add item worth ₹150 (15000 paise)
    await addProductItem(order.id, 'u1', 'Ajay', {
      entryType: 'manual',
      productName: 'Dry Fruits Box',
      quantity: 1,
      unitPriceRupees: 150,
    });

    const updatedOrder = await getOrderById(order.id);
    expect(updatedOrder?.groupItemSubtotalPaise).toBe(15000);
    expect(updatedOrder?.status).toBe('THRESHOLD_REACHED');
  });

  it('updates an item and updates group subtotal', async () => {
    const order = await createGroupOrder({
      title: 'Edit Item Order',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    const item = await addProductItem(order.id, 'u1', 'Ajay', {
      entryType: 'manual',
      productName: 'Biscuits',
      quantity: 1,
      unitPriceRupees: 30,
    });

    // Increase quantity from 1 to 3
    const updated = await updateProductItem(order.id, item.id, 'u1', {
      quantity: 3,
    });

    expect(updated.quantity).toBe(3);
    expect(updated.subtotalPaise).toBe(9000); // 3 * 3000 = 9000

    const updatedOrder = await getOrderById(order.id);
    expect(updatedOrder?.groupItemSubtotalPaise).toBe(9000);
  });

  it('prevents non-owners from editing items', async () => {
    const order = await createGroupOrder({
      title: 'Security Test',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    const item = await addProductItem(order.id, 'u2', 'Student B', {
      entryType: 'manual',
      productName: 'Chips',
      quantity: 1,
      unitPriceRupees: 20,
    });

    // Another user (u3) attempts to edit u2's item
    await expect(
      updateProductItem(order.id, item.id, 'u3', {
        quantity: 5,
      })
    ).rejects.toThrow(/You can only edit your own items/);
  });

  it('removes an item and reverts status to OPEN if total drops below threshold', async () => {
    const order = await createGroupOrder({
      title: 'Revert Threshold Order',
      platform: 'zepto',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 100, // ₹100 target
      durationMinutes: 30,
    });

    const item1 = await addProductItem(order.id, 'u1', 'Ajay', {
      entryType: 'manual',
      productName: 'Item 1',
      quantity: 1,
      unitPriceRupees: 60,
    });
    expect(item1.id).toBeDefined();

    const item2 = await addProductItem(order.id, 'u1', 'Ajay', {
      entryType: 'manual',
      productName: 'Item 2',
      quantity: 1,
      unitPriceRupees: 50,
    });

    // Total is ₹110 >= ₹100 -> THRESHOLD_REACHED
    let currentOrder = await getOrderById(order.id);
    expect(currentOrder?.status).toBe('THRESHOLD_REACHED');

    // Verify getOrderItems retrieves both
    const allItems = await getOrderItems(order.id);
    expect(allItems.length).toBe(2);

    // Remove item2 (₹50) -> total becomes ₹60 < ₹100
    await removeProductItem(order.id, item2.id, 'u1');

    currentOrder = await getOrderById(order.id);
    expect(currentOrder?.groupItemSubtotalPaise).toBe(6000);
    expect(currentOrder?.status).toBe('OPEN');
  });

  it('organizer can toggle item as unavailable', async () => {
    const order = await createGroupOrder({
      title: 'Unavailable Item Test',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay (Organizer)',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    const item = await addProductItem(order.id, 'u2', 'Student B', {
      entryType: 'manual',
      productName: 'Out of stock ice cream',
      quantity: 1,
      unitPriceRupees: 120,
    });

    const isNowUnavailable = await toggleItemUnavailable(order.id, item.id, 'u1');
    expect(isNowUnavailable).toBe(true);

    // Non-organizer cannot toggle unavailable
    await expect(toggleItemUnavailable(order.id, item.id, 'u2')).rejects.toThrow(
      /Only the organizer can mark items unavailable/
    );
  });
});
