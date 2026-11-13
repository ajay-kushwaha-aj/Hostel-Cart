import {
  collection,
  doc,
  getDocs,
  updateDoc,
  runTransaction,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  GroupOrder,
  OrderStatus,
  PaymentStatus,
  Participant,
  PaymentRecord,
  AdjustmentRecord,
} from '../types/order';
import { allocateCheckoutShares } from '../utils/calculations';
import { getOrderById, getOrderParticipants } from './orderService';
import { getOrderItems } from './itemService';
import { broadcastSyncEvent, subscribeToBroadcastSync } from './broadcastService';

const LOCAL_STORAGE_PAYMENTS_KEY = 'hostelcart_mock_payments';
const LOCAL_STORAGE_ADJUSTMENTS_KEY = 'hostelcart_mock_adjustments';

function getLocalPayments(orderId: string): PaymentRecord[] {
  const key = `${LOCAL_STORAGE_PAYMENTS_KEY}_${orderId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalPayments(orderId: string, payments: PaymentRecord[]): void {
  const key = `${LOCAL_STORAGE_PAYMENTS_KEY}_${orderId}`;
  localStorage.setItem(key, JSON.stringify(payments));
}

function getLocalAdjustments(orderId: string): AdjustmentRecord[] {
  const key = `${LOCAL_STORAGE_ADJUSTMENTS_KEY}_${orderId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    // Default initial mock adjustments for demo order
    if (orderId === 'order_demo_1') {
      const initial: AdjustmentRecord[] = [
        {
          id: 'adj_1',
          orderId: 'order_demo_1',
          type: 'DELIVERY_CHARGE',
          description: 'Platform delivery charge',
          amountPaise: 2500, // ₹25
          allocationMethod: 'PROPORTIONAL',
          createdBy: 'u1',
          createdAt: Date.now(),
        },
        {
          id: 'adj_2',
          orderId: 'order_demo_1',
          type: 'PLATFORM_FEE',
          description: 'Small cart / handling fee',
          amountPaise: 500, // ₹5
          allocationMethod: 'PROPORTIONAL',
          createdBy: 'u1',
          createdAt: Date.now(),
        },
      ];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalAdjustments(orderId: string, adjustments: AdjustmentRecord[]): void {
  const key = `${LOCAL_STORAGE_ADJUSTMENTS_KEY}_${orderId}`;
  localStorage.setItem(key, JSON.stringify(adjustments));
}

/**
 * Organizer action: Locks the cart to freeze participant edits before checkout.
 */
export async function lockOrder(orderId: string, organizerId: string): Promise<GroupOrder> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found.');

  if (order.organizerId !== organizerId) {
    throw new Error('Only the organizer can lock this order.');
  }

  if (['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(order.status)) {
    throw new Error(`Cannot lock an order that is ${order.status.toLowerCase()}.`);
  }

  const now = Date.now();

  if (!isFirebaseConfigured) {
    const stored = localStorage.getItem('hostelcart_mock_orders');
    if (stored) {
      const orders: GroupOrder[] = JSON.parse(stored);
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        orders[idx].status = 'LOCKED';
        orders[idx].lockedAt = now;
        orders[idx].updatedAt = now;
        localStorage.setItem('hostelcart_mock_orders', JSON.stringify(orders));
        broadcastSyncEvent('ORDER_UPDATED', orderId, orders[idx]);
        return orders[idx];
      }
    }
    order.status = 'LOCKED';
    order.lockedAt = now;
    return order;
  }

  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status: 'LOCKED',
    lockedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  order.status = 'LOCKED';
  order.lockedAt = now;
  broadcastSyncEvent('ORDER_UPDATED', orderId, order);
  return order;
}

/**
 * Organizer action: Unlocks a previously locked cart.
 */
export async function unlockOrder(orderId: string, organizerId: string): Promise<GroupOrder> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found.');

  if (order.organizerId !== organizerId) {
    throw new Error('Only the organizer can unlock this order.');
  }

  if (['COMPLETED', 'CANCELLED', 'EXPIRED', 'PLACED'].includes(order.status)) {
    throw new Error(`Cannot unlock an order that is ${order.status.toLowerCase()}.`);
  }

  // Determine whether minimum is reached to restore correct derived status
  const items = await getOrderItems(orderId);
  const activeSubtotal = items
    .filter((i) => i.isActive && !i.isUnavailable)
    .reduce((sum, i) => sum + i.subtotalPaise, 0);

  const restoredStatus: OrderStatus =
    activeSubtotal >= order.minimumAmountPaise ? 'THRESHOLD_REACHED' : 'OPEN';

  const now = Date.now();

  if (!isFirebaseConfigured) {
    const stored = localStorage.getItem('hostelcart_mock_orders');
    if (stored) {
      const orders: GroupOrder[] = JSON.parse(stored);
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        orders[idx].status = restoredStatus;
        orders[idx].lockedAt = null;
        orders[idx].updatedAt = now;
        localStorage.setItem('hostelcart_mock_orders', JSON.stringify(orders));
        broadcastSyncEvent('ORDER_UPDATED', orderId, orders[idx]);
        return orders[idx];
      }
    }
    order.status = restoredStatus;
    order.lockedAt = null;
    return order;
  }

  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status: restoredStatus,
    lockedAt: null,
    updatedAt: serverTimestamp(),
  });

  order.status = restoredStatus;
  order.lockedAt = null;
  broadcastSyncEvent('ORDER_UPDATED', orderId, order);
  return order;
}

/**
 * Organizer action: Transition order status through checkout lifecycle.
 */
export async function transitionOrderStatus(
  orderId: string,
  organizerId: string,
  newStatus: OrderStatus
): Promise<GroupOrder> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found.');

  if (order.organizerId !== organizerId) {
    throw new Error('Only the organizer can transition the order status.');
  }

  // Validate allowed state machine transitions (PRD Section 8)
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    OPEN: ['THRESHOLD_REACHED', 'LOCKED', 'CANCELLED'],
    THRESHOLD_REACHED: ['OPEN', 'LOCKED', 'CANCELLED'],
    LOCKED: ['OPEN', 'PAYMENT_PENDING', 'READY_FOR_CHECKOUT', 'CANCELLED'],
    PAYMENT_PENDING: ['LOCKED', 'READY_FOR_CHECKOUT', 'CANCELLED'],
    READY_FOR_CHECKOUT: ['PAYMENT_PENDING', 'PLACED', 'CANCELLED'],
    PLACED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [], // Terminal
    CANCELLED: [], // Terminal
    EXPIRED: [],   // Terminal
  };

  const allowed = validTransitions[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid transition: Cannot change status from ${order.status} to ${newStatus}.`
    );
  }

  const now = Date.now();
  const updates: Partial<GroupOrder> = {
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === 'PLACED') updates.placedAt = now;
  if (newStatus === 'COMPLETED') updates.completedAt = now;

  if (!isFirebaseConfigured) {
    const stored = localStorage.getItem('hostelcart_mock_orders');
    if (stored) {
      const orders: GroupOrder[] = JSON.parse(stored);
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        orders[idx] = { ...orders[idx], ...updates };
        localStorage.setItem('hostelcart_mock_orders', JSON.stringify(orders));
        broadcastSyncEvent('ORDER_UPDATED', orderId, orders[idx]);
        return orders[idx];
      }
    }
    const updated = { ...order, ...updates };
    return updated;
  }

  const orderRef = doc(db, 'orders', orderId);
  const fbUpdates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };
  if (newStatus === 'PLACED') fbUpdates.placedAt = serverTimestamp();
  if (newStatus === 'COMPLETED') fbUpdates.completedAt = serverTimestamp();

  await updateDoc(orderRef, fbUpdates);
  const updatedOrder = { ...order, ...updates };
  broadcastSyncEvent('ORDER_UPDATED', orderId, updatedOrder);
  return updatedOrder;
}

export interface CheckoutChargesInput {
  deliveryChargeRupees: number;
  platformFeeRupees: number;
  taxesRupees?: number;
  discountRupees?: number;
}

/**
 * Saves checkout adjustments, performs deterministic integer paise share allocation,
 * and updates participant records.
 */
export async function finalizeCheckoutAllocations(
  orderId: string,
  organizerId: string,
  charges: CheckoutChargesInput
): Promise<{
  adjustments: AdjustmentRecord[];
  finalTotalPayablePaise: number;
  allocations: { userId: string; allocatedTotalPaise: number }[];
}> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found.');

  if (order.organizerId !== organizerId) {
    throw new Error('Only the organizer can finalize checkout allocations.');
  }

  const participants = await getOrderParticipants(orderId);
  const activeParticipants = participants.filter((p) => p.isActive);

  const deliveryPaise = Math.round((charges.deliveryChargeRupees || 0) * 100);
  const platformFeePaise = Math.round((charges.platformFeeRupees || 0) * 100);
  const taxesPaise = Math.round((charges.taxesRupees || 0) * 100);
  const discountPaise = Math.round((charges.discountRupees || 0) * 100);

  const sharedChargesPaise = deliveryPaise + platformFeePaise + taxesPaise - discountPaise;
  const itemsTotalPaise = activeParticipants.reduce((sum, p) => sum + p.subtotalPaise, 0);
  const finalTotalPayablePaise = Math.max(0, itemsTotalPaise + sharedChargesPaise);

  // Run pure deterministic proportional allocation
  const allocationInputs = activeParticipants.map((p) => ({
    userId: p.userId,
    itemSubtotalPaise: p.subtotalPaise,
  }));

  const shareResults = allocateCheckoutShares(
    allocationInputs,
    sharedChargesPaise,
    finalTotalPayablePaise
  );

  const adjustments: AdjustmentRecord[] = [
    {
      id: 'adj_del',
      orderId,
      type: 'DELIVERY_CHARGE',
      description: 'Platform delivery fee',
      amountPaise: deliveryPaise,
      allocationMethod: 'PROPORTIONAL',
      createdBy: organizerId,
      createdAt: Date.now(),
    },
    {
      id: 'adj_fee',
      orderId,
      type: 'PLATFORM_FEE',
      description: 'Handling & platform fee',
      amountPaise: platformFeePaise,
      allocationMethod: 'PROPORTIONAL',
      createdBy: organizerId,
      createdAt: Date.now(),
    },
  ];

  if (taxesPaise > 0) {
    adjustments.push({
      id: 'adj_tax',
      orderId,
      type: 'TAX',
      description: 'Checkout taxes',
      amountPaise: taxesPaise,
      allocationMethod: 'PROPORTIONAL',
      createdBy: organizerId,
      createdAt: Date.now(),
    });
  }

  if (discountPaise > 0) {
    adjustments.push({
      id: 'adj_disc',
      orderId,
      type: 'DISCOUNT',
      description: 'Platform coupon discount',
      amountPaise: -discountPaise,
      allocationMethod: 'PROPORTIONAL',
      createdBy: organizerId,
      createdAt: Date.now(),
    });
  }

  if (!isFirebaseConfigured) {
    saveLocalAdjustments(orderId, adjustments);

    // Update participant records in local storage
    const key = `hostelcart_mock_participants_${orderId}`;
    const storedP = localStorage.getItem(key);
    if (storedP) {
      const parts: Participant[] = JSON.parse(storedP);
      parts.forEach((p) => {
        const alloc = shareResults.find((s) => s.userId === p.userId);
        if (alloc) {
          p.allocatedTotalPaise = alloc.totalPayablePaise;
        }
      });
      localStorage.setItem(key, JSON.stringify(parts));
    }

    // Update actualCheckoutTotalPaise in order
    const storedO = localStorage.getItem('hostelcart_mock_orders');
    if (storedO) {
      const orders: GroupOrder[] = JSON.parse(storedO);
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        orders[idx].actualCheckoutTotalPaise = finalTotalPayablePaise;
        orders[idx].updatedAt = Date.now();
        localStorage.setItem('hostelcart_mock_orders', JSON.stringify(orders));
      }
    }

    broadcastSyncEvent('ADJUSTMENTS_UPDATED', orderId);
    broadcastSyncEvent('ORDER_UPDATED', orderId);
    return {
      adjustments,
      finalTotalPayablePaise,
      allocations: shareResults.map((s) => ({
        userId: s.userId,
        allocatedTotalPaise: s.totalPayablePaise,
      })),
    };
  }

  // Real Firebase mode
  const orderRef = doc(db, 'orders', orderId);

  await runTransaction(db, async (transaction) => {
    transaction.update(orderRef, {
      actualCheckoutTotalPaise: finalTotalPayablePaise,
      updatedAt: serverTimestamp(),
    });

    // Save adjustment documents and update participant allocations
    for (const alloc of shareResults) {
      const pRef = doc(db, 'orders', orderId, 'participants', alloc.userId);
      transaction.update(pRef, {
        allocatedTotalPaise: alloc.totalPayablePaise,
      });
    }
  });

  broadcastSyncEvent('ORDER_UPDATED', orderId);
  return {
    adjustments,
    finalTotalPayablePaise,
    allocations: shareResults.map((s) => ({
      userId: s.userId,
      allocatedTotalPaise: s.totalPayablePaise,
    })),
  };
}

/**
 * Participant action: Reports that they have paid their share outside the app (UPI).
 */
export async function reportParticipantPayment(
  orderId: string,
  userId: string,
  userName: string,
  amountPaise: number,
  reference?: string
): Promise<PaymentRecord> {
  const paymentId = 'pay_' + Math.random().toString(36).substring(2, 9);
  const now = Date.now();

  const record: PaymentRecord = {
    id: paymentId,
    orderId,
    userId,
    userName,
    amountPaise,
    status: 'PAID_REPORTED',
    paymentMethod: 'UPI_EXTERNAL',
    reference: reference?.trim() || null,
    reportedBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured) {
    const payments = getLocalPayments(orderId);
    payments.push(record);
    saveLocalPayments(orderId, payments);

    // Update participant paymentStatus in local store
    const key = `hostelcart_mock_participants_${orderId}`;
    const storedP = localStorage.getItem(key);
    if (storedP) {
      const parts: Participant[] = JSON.parse(storedP);
      const target = parts.find((p) => p.userId === userId);
      if (target) {
        target.paymentStatus = 'PAID_REPORTED';
        localStorage.setItem(key, JSON.stringify(parts));
      }
    }

    broadcastSyncEvent('PAYMENT_UPDATED', orderId);
    broadcastSyncEvent('ORDER_UPDATED', orderId);
    return record;
  }

  const paymentRef = doc(db, 'orders', orderId, 'payments', paymentId);
  const participantRef = doc(db, 'orders', orderId, 'participants', userId);

  await runTransaction(db, async (transaction) => {
    transaction.set(paymentRef, {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.update(participantRef, {
      paymentStatus: 'PAID_REPORTED',
    });
  });

  broadcastSyncEvent('PAYMENT_UPDATED', orderId);
  broadcastSyncEvent('ORDER_UPDATED', orderId);
  return record;
}

/**
 * Organizer action: Confirms, waives, or disputes a participant's payment status.
 */
export async function updateParticipantPaymentStatus(
  orderId: string,
  organizerId: string,
  targetUserId: string,
  newStatus: PaymentStatus
): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found.');

  if (order.organizerId !== organizerId) {
    throw new Error('Only the organizer can update participant payment verification.');
  }

  if (!isFirebaseConfigured) {
    const key = `hostelcart_mock_participants_${orderId}`;
    const storedP = localStorage.getItem(key);
    if (storedP) {
      const parts: Participant[] = JSON.parse(storedP);
      const target = parts.find((p) => p.userId === targetUserId);
      if (target) {
        target.paymentStatus = newStatus;
        localStorage.setItem(key, JSON.stringify(parts));
      }
    }
    broadcastSyncEvent('PAYMENT_UPDATED', orderId);
    broadcastSyncEvent('ORDER_UPDATED', orderId);
    return;
  }

  const participantRef = doc(db, 'orders', orderId, 'participants', targetUserId);
  await updateDoc(participantRef, {
    paymentStatus: newStatus,
  });

  broadcastSyncEvent('PAYMENT_UPDATED', orderId);
  broadcastSyncEvent('ORDER_UPDATED', orderId);
}

/**
 * Fetches adjustments for an order.
 */
export async function getOrderAdjustments(orderId: string): Promise<AdjustmentRecord[]> {
  if (!isFirebaseConfigured) {
    return getLocalAdjustments(orderId);
  }

  try {
    const ref = collection(db, 'orders', orderId, 'adjustments');
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AdjustmentRecord[];
  } catch {
    return getLocalAdjustments(orderId);
  }
}

/**
 * Fetches recorded payment history for an order.
 */
export async function getOrderPayments(orderId: string): Promise<PaymentRecord[]> {
  if (!isFirebaseConfigured) {
    return getLocalPayments(orderId);
  }

  try {
    const ref = collection(db, 'orders', orderId, 'payments');
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as PaymentRecord[];
  } catch {
    return getLocalPayments(orderId);
  }
}

/**
 * Subscribes to order adjustments in real-time.
 */
export function subscribeToOrderAdjustments(
  orderId: string,
  callback: (adjustments: AdjustmentRecord[]) => void
): () => void {
  if (!isFirebaseConfigured) {
    callback(getLocalAdjustments(orderId));
    const handleStorage = () => callback(getLocalAdjustments(orderId));
    window.addEventListener('storage', handleStorage);
    const unsub = subscribeToBroadcastSync(orderId, () => {
      callback(getLocalAdjustments(orderId));
    });
    return () => {
      window.removeEventListener('storage', handleStorage);
      unsub();
    };
  }

  try {
    const ref = collection(db, 'orders', orderId, 'adjustments');
    const q = query(ref, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toMillis?.() || Date.now(),
      })) as AdjustmentRecord[];
      callback(records);
    });
  } catch {
    callback(getLocalAdjustments(orderId));
    return () => {};
  }
}

/**
 * Subscribes to order payment records in real-time.
 */
export function subscribeToOrderPayments(
  orderId: string,
  callback: (payments: PaymentRecord[]) => void
): () => void {
  if (!isFirebaseConfigured) {
    callback(getLocalPayments(orderId));
    const handleStorage = () => callback(getLocalPayments(orderId));
    window.addEventListener('storage', handleStorage);
    const unsub = subscribeToBroadcastSync(orderId, () => {
      callback(getLocalPayments(orderId));
    });
    return () => {
      window.removeEventListener('storage', handleStorage);
      unsub();
    };
  }

  try {
    const ref = collection(db, 'orders', orderId, 'payments');
    const q = query(ref, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toMillis?.() || Date.now(),
        updatedAt: d.data().updatedAt?.toMillis?.() || Date.now(),
      })) as PaymentRecord[];
      callback(records);
    });
  } catch {
    callback(getLocalPayments(orderId));
    return () => {};
  }
}
