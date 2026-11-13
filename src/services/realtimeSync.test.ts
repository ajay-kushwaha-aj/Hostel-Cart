import { describe, it, expect, beforeEach } from 'vitest';
import {
  broadcastSyncEvent,
  subscribeToBroadcastSync,
} from './broadcastService';
import {
  createGroupOrder,
  subscribeToOrder,
  subscribeToHostelOrders,
} from './orderService';
import {
  addProductItem,
  subscribeToOrderItems,
} from './itemService';
import { PILOT_HOSTEL } from '../utils/constants';

describe('Real-Time Collaboration & Synchronization (Phase 5)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('broadcasts and receives real-time sync events across subscribers', () => {
    const received: string[] = [];
    const unsubscribe = subscribeToBroadcastSync('order_test_sync', (event) => {
      received.push(event.type);
    });

    broadcastSyncEvent('ITEM_ADDED', 'order_test_sync', { name: 'Milk' });
    broadcastSyncEvent('ITEM_UPDATED', 'order_test_sync', { qty: 2 });
    // Broadcast for different order should be ignored
    broadcastSyncEvent('ITEM_ADDED', 'other_order', { name: 'Chips' });

    expect(received).toContain('ITEM_ADDED');
    expect(received).toContain('ITEM_UPDATED');
    expect(received.length).toBe(2);

    unsubscribe();
  });

  it('notifies multiple order listeners in real-time when items are added', async () => {
    const order = await createGroupOrder({
      title: 'Simultaneous Collab Cart',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    const listener1Items: number[] = [];
    const listener2Items: number[] = [];

    const unsub1 = subscribeToOrderItems(order.id, (items) => {
      listener1Items.push(items.length);
    });

    const unsub2 = subscribeToOrderItems(order.id, (items) => {
      listener2Items.push(items.length);
    });

    // Participant 1 adds an item
    await addProductItem(order.id, 'u1', 'Ajay', {
      entryType: 'manual',
      productName: 'Bread',
      quantity: 1,
      unitPriceRupees: 40,
    });

    // Participant 2 adds an item
    await addProductItem(order.id, 'u2', 'Rohan', {
      entryType: 'manual',
      productName: 'Butter',
      quantity: 1,
      unitPriceRupees: 60,
    });

    // Both listeners should have observed the updates
    expect(listener1Items[listener1Items.length - 1]).toBe(2);
    expect(listener2Items[listener2Items.length - 1]).toBe(2);

    unsub1();
    unsub2();
  });

  it('reconciles simultaneous additions into exact group subtotal', async () => {
    const order = await createGroupOrder({
      title: 'Simultaneous Total Test',
      platform: 'zepto',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 149,
      durationMinutes: 30,
    });

    // 3 participants add items concurrently
    await Promise.all([
      addProductItem(order.id, 'u1', 'Ajay', {
        entryType: 'manual',
        productName: 'Item A',
        quantity: 1,
        unitPriceRupees: 50,
      }),
      addProductItem(order.id, 'u2', 'Rohan', {
        entryType: 'manual',
        productName: 'Item B',
        quantity: 2,
        unitPriceRupees: 30, // 2 * 30 = 60
      }),
      addProductItem(order.id, 'u3', 'Sneha', {
        entryType: 'manual',
        productName: 'Item C',
        quantity: 1,
        unitPriceRupees: 45,
      }),
    ]);

    let latestOrder: any = null;
    const unsub = subscribeToOrder(order.id, (o) => {
      latestOrder = o;
    });

    expect(latestOrder).not.toBeNull();
    // 5000 + 6000 + 4500 = 15500 paise (₹155)
    expect(latestOrder.groupItemSubtotalPaise).toBe(15500);
    // ₹155 >= ₹149 target -> status is THRESHOLD_REACHED
    expect(latestOrder.status).toBe('THRESHOLD_REACHED');

    unsub();
  });

  it('notifies hostel orders dashboard listener when new order is created', async () => {
    let orderCount = 0;
    const unsub = subscribeToHostelOrders(PILOT_HOSTEL.id, (orders) => {
      orderCount = orders.length;
    });

    const initialCount = orderCount;

    await createGroupOrder({
      title: 'Another Cart',
      platform: 'instamart',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    expect(orderCount).toBe(initialCount + 1);
    unsub();
  });
});
