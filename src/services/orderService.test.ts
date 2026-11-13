import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGroupOrder,
  getHostelOrders,
  getOrderById,
  findOrderByInviteCode,
  joinGroupOrder,
  leaveGroupOrder,
  generateInviteCode,
} from './orderService';
import { PILOT_HOSTEL } from '../utils/constants';

describe('Order Service (Phase 3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates a clean human-readable invite code with CART- prefix', () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^CART-[A-Z0-9]{4}$/);
  });

  it('creates a new group order with organizer as first participant', async () => {
    const order = await createGroupOrder({
      title: 'Midnight Snacks & Cold Drinks',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay (Organizer)',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 45,
      pickupNote: 'Room 304',
    });

    expect(order.id).toBeDefined();
    expect(order.title).toBe('Midnight Snacks & Cold Drinks');
    expect(order.platform).toBe('blinkit');
    expect(order.minimumAmountPaise).toBe(19900);
    expect(order.groupItemSubtotalPaise).toBe(0);
    expect(order.participantCount).toBe(1);
    expect(order.status).toBe('OPEN');
    expect(order.inviteCode).toMatch(/^CART-/);

    // Verify order is retrievable
    const fetched = await getOrderById(order.id);
    expect(fetched?.title).toBe(order.title);

    // Verify hostel orders query retrieves it
    const hostelOrders = await getHostelOrders(PILOT_HOSTEL.id);
    expect(hostelOrders.some((o) => o.id === order.id)).toBe(true);
  });

  it('rejects order creation with empty title or invalid threshold', async () => {
    await expect(
      createGroupOrder({
        title: '',
        platform: 'blinkit',
        organizerId: 'u1',
        organizerName: 'Ajay',
        hostelId: PILOT_HOSTEL.id,
        minimumAmountRupees: 199,
        durationMinutes: 30,
      })
    ).rejects.toThrow(/Order title is required/);

    await expect(
      createGroupOrder({
        title: 'Valid Title',
        platform: 'blinkit',
        organizerId: 'u1',
        organizerName: 'Ajay',
        hostelId: PILOT_HOSTEL.id,
        minimumAmountRupees: 2, // Less than minimum ₹10
        durationMinutes: 30,
      })
    ).rejects.toThrow(/Minimum threshold must be at least ₹10/);
  });

  it('finds an order by its unique invite code in the same hostel', async () => {
    const created = await createGroupOrder({
      title: 'Hostel Milk & Fruits',
      platform: 'zepto',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 149,
      durationMinutes: 30,
    });

    const found = await findOrderByInviteCode(created.inviteCode, PILOT_HOSTEL.id);
    expect(found.id).toBe(created.id);
    expect(found.title).toBe('Hostel Milk & Fruits');
  });

  it('rejects finding code if hostel does not match', async () => {
    const created = await createGroupOrder({
      title: 'Private Order',
      platform: 'instamart',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    await expect(
      findOrderByInviteCode(created.inviteCode, 'DIFFERENT_HOSTEL_999')
    ).rejects.toThrow(/different hostel/);
  });

  it('allows another student to join order and increments participant count', async () => {
    const order = await createGroupOrder({
      title: 'Shared Snacks',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    const joinResult = await joinGroupOrder(
      order.id,
      'u2',
      'Rohan (Student B)',
      PILOT_HOSTEL.id
    );

    expect(joinResult.success).toBe(true);

    const updated = await getOrderById(order.id);
    expect(updated?.participantCount).toBe(2);
  });

  it('allows a participant to leave the order and decrements count', async () => {
    const order = await createGroupOrder({
      title: 'Leaving Test Order',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    await joinGroupOrder(order.id, 'u2', 'Rohan', PILOT_HOSTEL.id);
    let current = await getOrderById(order.id);
    expect(current?.participantCount).toBe(2);

    const leaveRes = await leaveGroupOrder(order.id, 'u2');
    expect(leaveRes.success).toBe(true);

    current = await getOrderById(order.id);
    expect(current?.participantCount).toBe(1);
  });

  it('prevents organizer from leaving their own order', async () => {
    const order = await createGroupOrder({
      title: 'Organizer Leave Test',
      platform: 'blinkit',
      organizerId: 'u1',
      organizerName: 'Ajay',
      hostelId: PILOT_HOSTEL.id,
      minimumAmountRupees: 199,
      durationMinutes: 30,
    });

    await expect(leaveGroupOrder(order.id, 'u1')).rejects.toThrow(
      /The organizer cannot leave their own order/
    );
  });
});
