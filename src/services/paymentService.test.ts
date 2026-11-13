import { describe, it, expect, beforeEach } from 'vitest';
import {
  lockOrder,
  unlockOrder,
  transitionOrderStatus,
  finalizeCheckoutAllocations,
  reportParticipantPayment,
  updateParticipantPaymentStatus,
  getOrderAdjustments,
  getOrderPayments,
} from './paymentService';
import { createGroupOrder, joinGroupOrder, getOrderById } from './orderService';
import { addProductItem } from './itemService';
import { PILOT_HOSTEL } from '../utils/constants';

describe('Payment & Settlement Service (Phase 6)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  async function createTestOrder() {
    const order = await createGroupOrder({
      title: 'Hostel Night Snacks',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay (Organizer)',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 100, // ₹100 target = 10000 paise
      durationMinutes: 30,
      pickupNote: 'Room 304',
    });

    // Add item for organizer: ₹60 = 6000 paise
    await addProductItem(
      order.id,
      'u1',
      'Ajay (Organizer)',
      {
        productName: 'Chips and Cold Drink',
        entryType: 'manual',
        quantity: 1,
        unitPriceRupees: 60,
      }
    );

    // Join second participant
    await joinGroupOrder(order.id, 'u2', 'Rohan (Room 102)', PILOT_HOSTEL.id);

    // Add item for participant: ₹50 = 5000 paise
    await addProductItem(
      order.id,
      'u2',
      'Rohan (Room 102)',
      {
        productName: 'Biscuits Pack',
        entryType: 'manual',
        quantity: 1,
        unitPriceRupees: 50,
      }
    );

    return order;
  }

  it('allows organizer to lock order and prevents non-organizer from locking', async () => {
    const order = await createTestOrder();

    // Non-organizer tries to lock
    await expect(lockOrder(order.id, 'u2')).rejects.toThrow(
      'Only the organizer can lock this order.'
    );

    // Organizer locks order
    const locked = await lockOrder(order.id, 'u1');
    expect(locked.status).toBe('LOCKED');
    expect(locked.lockedAt).toBeDefined();

    const fetched = await getOrderById(order.id);
    expect(fetched?.status).toBe('LOCKED');
  });

  it('allows organizer to unlock order, restoring derived status', async () => {
    const order = await createTestOrder();
    await lockOrder(order.id, 'u1');

    // Non-organizer tries to unlock
    await expect(unlockOrder(order.id, 'u2')).rejects.toThrow(
      'Only the organizer can unlock this order.'
    );

    // Organizer unlocks order: 6000 + 5000 = 11000 paise >= 10000 paise (threshold reached)
    const unlocked = await unlockOrder(order.id, 'u1');
    expect(unlocked.status).toBe('THRESHOLD_REACHED');
    expect(unlocked.lockedAt).toBeNull();
  });

  it('enforces valid order lifecycle transitions', async () => {
    const order = await createTestOrder();
    await lockOrder(order.id, 'u1');

    // Invalid transition: cannot jump directly from LOCKED to COMPLETED
    await expect(transitionOrderStatus(order.id, 'u1', 'COMPLETED')).rejects.toThrow(
      'Invalid transition'
    );

    // Valid progression: LOCKED -> PAYMENT_PENDING
    const pending = await transitionOrderStatus(order.id, 'u1', 'PAYMENT_PENDING');
    expect(pending.status).toBe('PAYMENT_PENDING');

    // PAYMENT_PENDING -> READY_FOR_CHECKOUT
    const ready = await transitionOrderStatus(order.id, 'u1', 'READY_FOR_CHECKOUT');
    expect(ready.status).toBe('READY_FOR_CHECKOUT');

    // READY_FOR_CHECKOUT -> PLACED
    const placed = await transitionOrderStatus(order.id, 'u1', 'PLACED');
    expect(placed.status).toBe('PLACED');
    expect(placed.placedAt).toBeDefined();

    // PLACED -> COMPLETED
    const completed = await transitionOrderStatus(order.id, 'u1', 'COMPLETED');
    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedAt).toBeDefined();
  });

  it('calculates proportional checkout allocations with exact integer paise precision', async () => {
    const order = await createTestOrder();
    await lockOrder(order.id, 'u1');

    // Total items = 6000 + 5000 = 11000 paise (₹110)
    // Charges: Delivery ₹25, Platform fee ₹5, Discount ₹10 -> net shared charges = ₹20 = 2000 paise
    // Final payable = ₹130 = 13000 paise
    const result = await finalizeCheckoutAllocations(order.id, 'u1', {
      deliveryChargeRupees: 25,
      platformFeeRupees: 5,
      discountRupees: 10,
    });

    expect(result.finalTotalPayablePaise).toBe(13000);
    expect(result.adjustments.length).toBeGreaterThanOrEqual(3);

    // Check allocations sum exactly to finalTotalPayablePaise
    const sumAllocated = result.allocations.reduce((sum, a) => sum + a.allocatedTotalPaise, 0);
    expect(sumAllocated).toBe(13000);

    // Verify order adjustments are stored and retrievable
    const savedAdjustments = await getOrderAdjustments(order.id);
    expect(savedAdjustments.length).toBe(result.adjustments.length);
  });

  it('allows participant to report UPI payment and organizer to verify it', async () => {
    const order = await createTestOrder();
    await lockOrder(order.id, 'u1');

    // Participant u2 reports payment
    const payment = await reportParticipantPayment(
      order.id,
      'u2',
      'Rohan',
      5900,
      'UPI123456789'
    );

    expect(payment.id).toBeDefined();
    expect(payment.status).toBe('PAID_REPORTED');
    expect(payment.reference).toBe('UPI123456789');

    // Verify payments query returns it
    const payments = await getOrderPayments(order.id);
    expect(payments.length).toBe(1);
    expect(payments[0].id).toBe(payment.id);

    // Non-organizer cannot verify/update payment status
    await expect(
      updateParticipantPaymentStatus(order.id, 'u2', 'u2', 'WAIVED')
    ).rejects.toThrow('Only the organizer can update participant payment verification.');

    // Organizer verifies payment as WAIVED/SETTLED
    await updateParticipantPaymentStatus(order.id, 'u1', 'u2', 'WAIVED');

    // Organizer disputes payment
    await updateParticipantPaymentStatus(order.id, 'u1', 'u2', 'DISPUTED');
  });
});
