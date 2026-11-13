import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { GroupOrder, PlatformId, Participant } from '../types/order';
import { validateThresholdRupees, validateInviteCode } from '../utils/validators';
import { PILOT_HOSTEL } from '../utils/constants';

const LOCAL_STORAGE_ORDERS_KEY = 'hostelcart_mock_orders';
const LOCAL_STORAGE_PARTICIPANTS_KEY = 'hostelcart_mock_participants';

/**
 * Generates a human-friendly unique invite code (e.g. CART-9X4K)
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars O, 0, 1, I
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CART-${code}`;
}

// In-memory fallback / localStorage store for offline & preview mode
function getLocalOrders(): GroupOrder[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
  if (!stored) {
    // Default initial mock orders for seamless experience
    const initialOrders: GroupOrder[] = [
      {
        id: 'order_demo_1',
        title: 'Sunday Evening Snacks & Dairy',
        platform: 'blinkit',
        organizerId: 'u1',
        organizerName: 'Ajay (Room 304)',
        hostelId: PILOT_HOSTEL.id,
        minimumAmountPaise: 19900,
        groupItemSubtotalPaise: 14500,
        participantCount: 3,
        status: 'OPEN',
        inviteCode: 'CART-SNACK',
        expiresAt: Date.now() + 1000 * 60 * 35,
        createdAt: Date.now() - 1000 * 60 * 15,
        updatedAt: Date.now() - 1000 * 60 * 2,
        description: 'Ordering milk, bread, and chips. Let us hit ₹199!',
        pickupNote: 'Pick up from Room 304 after delivery',
      },
      {
        id: 'order_demo_2',
        title: 'Late Night Fruits & Energy Drinks',
        platform: 'zepto',
        organizerId: 'u2',
        organizerName: 'Rahul (Room 210)',
        hostelId: PILOT_HOSTEL.id,
        minimumAmountPaise: 14900,
        groupItemSubtotalPaise: 16800,
        participantCount: 2,
        status: 'THRESHOLD_REACHED',
        inviteCode: 'CART-ZEPTO',
        expiresAt: Date.now() + 1000 * 60 * 20,
        createdAt: Date.now() - 1000 * 60 * 25,
        updatedAt: Date.now() - 1000 * 60 * 5,
        description: 'Already crossed minimum order value. Locking soon!',
        pickupNote: 'Meet at ground floor common room',
      },
    ];
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(initialOrders));
    return initialOrders;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: GroupOrder[]): void {
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
}

function getLocalParticipants(orderId: string): Participant[] {
  const key = `${LOCAL_STORAGE_PARTICIPANTS_KEY}_${orderId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    if (orderId === 'order_demo_1') {
      const initial: Participant[] = [
        {
          userId: 'u1',
          displayName: 'Ajay (Organizer)',
          subtotalPaise: 5400,
          paymentStatus: 'PENDING',
          joinedAt: Date.now() - 1000 * 60 * 15,
          isActive: true,
        },
        {
          userId: 'u2',
          displayName: 'Rohan (Room 102)',
          subtotalPaise: 4500,
          paymentStatus: 'PENDING',
          joinedAt: Date.now() - 1000 * 60 * 10,
          isActive: true,
        },
        {
          userId: 'u3',
          displayName: 'Sneha (Room 214)',
          subtotalPaise: 4600,
          paymentStatus: 'PENDING',
          joinedAt: Date.now() - 1000 * 60 * 5,
          isActive: true,
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

function saveLocalParticipants(orderId: string, participants: Participant[]): void {
  const key = `${LOCAL_STORAGE_PARTICIPANTS_KEY}_${orderId}`;
  localStorage.setItem(key, JSON.stringify(participants));
}

export interface CreateOrderParams {
  title: string;
  platform: PlatformId;
  organizerId: string;
  organizerName: string;
  hostelId: string;
  minimumAmountRupees: number;
  durationMinutes: number;
  description?: string;
  pickupNote?: string;
  participantLimit?: number | null;
}

/**
 * Creates a new group order session in the user's hostel.
 */
export async function createGroupOrder(params: CreateOrderParams): Promise<GroupOrder> {
  const {
    title,
    platform,
    organizerId,
    organizerName,
    hostelId,
    minimumAmountRupees,
    durationMinutes,
    description = '',
    pickupNote = '',
    participantLimit = null,
  } = params;

  if (!title.trim()) {
    throw new Error('Order title is required.');
  }

  const thresholdCheck = validateThresholdRupees(minimumAmountRupees);
  if (!thresholdCheck.isValid) {
    throw new Error(thresholdCheck.error || 'Invalid minimum threshold.');
  }

  const minimumAmountPaise = Math.round(minimumAmountRupees * 100);
  const now = Date.now();
  const expiresAt = now + durationMinutes * 60 * 1000;
  const inviteCode = generateInviteCode();
  const orderId = 'order_' + Math.random().toString(36).substring(2, 10);

  const orderData: GroupOrder = {
    id: orderId,
    title: title.trim(),
    platform,
    organizerId,
    organizerName,
    hostelId,
    minimumAmountPaise,
    groupItemSubtotalPaise: 0,
    participantCount: 1,
    status: 'OPEN',
    inviteCode,
    expiresAt,
    createdAt: now,
    updatedAt: now,
    description: description.trim(),
    pickupNote: pickupNote.trim(),
    participantLimit,
  };

  const organizerParticipant: Participant = {
    userId: organizerId,
    displayName: organizerName,
    subtotalPaise: 0,
    paymentStatus: 'PENDING',
    joinedAt: now,
    isActive: true,
  };

  if (!isFirebaseConfigured) {
    // Local / Offline demo mode
    const orders = getLocalOrders();
    orders.unshift(orderData);
    saveLocalOrders(orders);
    saveLocalParticipants(orderId, [organizerParticipant]);
    return orderData;
  }

  // Real Firebase mode with transaction
  const orderRef = doc(db, 'orders', orderId);
  const participantRef = doc(db, 'orders', orderId, 'participants', organizerId);

  await runTransaction(db, async (transaction) => {
    transaction.set(orderRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.set(participantRef, {
      ...organizerParticipant,
      joinedAt: serverTimestamp(),
    });
  });

  return orderData;
}

/**
 * Fetches all orders belonging to a specific hostel.
 */
export async function getHostelOrders(hostelId: string): Promise<GroupOrder[]> {
  if (!isFirebaseConfigured) {
    const orders = getLocalOrders();
    return orders.filter((o) => o.hostelId === hostelId);
  }

  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('hostelId', '==', hostelId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as GroupOrder[];
  } catch (err) {
    console.warn('Falling back to local orders query:', err);
    return getLocalOrders().filter((o) => o.hostelId === hostelId);
  }
}

/**
 * Subscribes in real time to orders in a hostel.
 */
export function subscribeToHostelOrders(
  hostelId: string,
  callback: (orders: GroupOrder[]) => void
): () => void {
  if (!isFirebaseConfigured) {
    // Emit current local orders and listen to storage events
    callback(getLocalOrders().filter((o) => o.hostelId === hostelId));
    const handleStorage = () => {
      callback(getLocalOrders().filter((o) => o.hostelId === hostelId));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }

  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('hostelId', '==', hostelId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toMillis?.() || Date.now(),
        updatedAt: d.data().updatedAt?.toMillis?.() || Date.now(),
      })) as GroupOrder[];
      callback(orders);
    });
  } catch (err) {
    console.warn('Realtime listener fallback:', err);
    callback(getLocalOrders().filter((o) => o.hostelId === hostelId));
    return () => {};
  }
}

/**
 * Fetches an order by its ID.
 */
export async function getOrderById(orderId: string): Promise<GroupOrder | null> {
  if (!isFirebaseConfigured) {
    const orders = getLocalOrders();
    return orders.find((o) => o.id === orderId) || null;
  }

  try {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toMillis?.() || Date.now(),
      updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
    } as GroupOrder;
  } catch {
    return getLocalOrders().find((o) => o.id === orderId) || null;
  }
}

/**
 * Subscribes to single order updates.
 */
export function subscribeToOrder(
  orderId: string,
  callback: (order: GroupOrder | null) => void
): () => void {
  if (!isFirebaseConfigured) {
    const order = getLocalOrders().find((o) => o.id === orderId) || null;
    callback(order);
    const handleStorage = () => {
      callback(getLocalOrders().find((o) => o.id === orderId) || null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }

  const orderRef = doc(db, 'orders', orderId);
  return onSnapshot(orderRef, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toMillis?.() || Date.now(),
      updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
    } as GroupOrder);
  });
}

/**
 * Finds an order by its unique invite code.
 */
export async function findOrderByInviteCode(
  inviteCode: string,
  userHostelId: string
): Promise<GroupOrder> {
  const codeValidation = validateInviteCode(inviteCode);
  if (!codeValidation.isValid) {
    throw new Error(codeValidation.error || 'Invalid code format');
  }

  const cleanCode = inviteCode.trim().toUpperCase();

  if (!isFirebaseConfigured) {
    const orders = getLocalOrders();
    const match = orders.find((o) => o.inviteCode.toUpperCase() === cleanCode);
    if (!match) {
      throw new Error('No active order found with this invite code.');
    }
    if (match.hostelId !== userHostelId) {
      throw new Error('This order belongs to a different hostel.');
    }
    return match;
  }

  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('inviteCode', '==', cleanCode),
    where('hostelId', '==', userHostelId)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('No order found with this code in your hostel.');
  }

  const firstDoc = snap.docs[0];
  return { id: firstDoc.id, ...firstDoc.data() } as GroupOrder;
}

/**
 * Joins a group order as a participant.
 */
export async function joinGroupOrder(
  orderId: string,
  userId: string,
  displayName: string,
  userHostelId: string
): Promise<{ success: boolean; message: string; order: GroupOrder }> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  if (order.hostelId !== userHostelId) {
    throw new Error('You cannot join an order from another hostel.');
  }

  // Check state machine: can only join if OPEN or THRESHOLD_REACHED
  if (!['OPEN', 'THRESHOLD_REACHED'].includes(order.status)) {
    throw new Error(
      `Cannot join order: Cart is currently ${order.status.toLowerCase().replace('_', ' ')}.`
    );
  }

  if (Date.now() > order.expiresAt) {
    throw new Error('Cannot join order: Order deadline has passed.');
  }

  if (order.participantLimit && order.participantCount >= order.participantLimit) {
    throw new Error('Cannot join order: Participant limit reached.');
  }

  if (!isFirebaseConfigured) {
    const participants = getLocalParticipants(orderId);
    const existing = participants.find((p) => p.userId === userId);

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.leftAt = null;
        saveLocalParticipants(orderId, participants);
      }
      return { success: true, message: 'You have re-joined this cart!', order };
    }

    const newParticipant: Participant = {
      userId,
      displayName,
      subtotalPaise: 0,
      paymentStatus: 'PENDING',
      joinedAt: Date.now(),
      isActive: true,
    };
    participants.push(newParticipant);
    saveLocalParticipants(orderId, participants);

    const orders = getLocalOrders();
    const orderIdx = orders.findIndex((o) => o.id === orderId);
    if (orderIdx !== -1) {
      orders[orderIdx].participantCount += 1;
      orders[orderIdx].updatedAt = Date.now();
      saveLocalOrders(orders);
    }

    return { success: true, message: 'Joined group cart successfully!', order };
  }

  // Real Firebase mode using transaction
  const orderRef = doc(db, 'orders', orderId);
  const participantRef = doc(db, 'orders', orderId, 'participants', userId);

  await runTransaction(db, async (transaction) => {
    const oSnap = await transaction.get(orderRef);
    if (!oSnap.exists()) throw new Error('Order does not exist.');

    const pSnap = await transaction.get(participantRef);
    if (pSnap.exists() && pSnap.data()?.isActive) {
      return; // Already active participant
    }

    transaction.set(
      participantRef,
      {
        userId,
        displayName,
        subtotalPaise: pSnap.exists() ? pSnap.data().subtotalPaise || 0 : 0,
        paymentStatus: 'PENDING',
        joinedAt: serverTimestamp(),
        isActive: true,
        leftAt: null,
      },
      { merge: true }
    );

    const currentCount = oSnap.data().participantCount || 1;
    transaction.update(orderRef, {
      participantCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    });
  });

  return { success: true, message: 'Joined cart successfully!', order };
}

/**
 * Leaves a group order (only permitted while order is OPEN/THRESHOLD_REACHED).
 */
export async function leaveGroupOrder(
  orderId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  if (order.organizerId === userId) {
    throw new Error(
      'The organizer cannot leave their own order. You may cancel the order if needed.'
    );
  }

  if (!['OPEN', 'THRESHOLD_REACHED'].includes(order.status)) {
    throw new Error('Cannot leave order after cart has been locked or placed.');
  }

  if (!isFirebaseConfigured) {
    const participants = getLocalParticipants(orderId);
    const target = participants.find((p) => p.userId === userId);
    if (target) {
      target.isActive = false;
      target.leftAt = Date.now();
      saveLocalParticipants(orderId, participants);

      const orders = getLocalOrders();
      const orderIdx = orders.findIndex((o) => o.id === orderId);
      if (orderIdx !== -1) {
        orders[orderIdx].participantCount = Math.max(1, orders[orderIdx].participantCount - 1);
        orders[orderIdx].updatedAt = Date.now();
        saveLocalOrders(orders);
      }
    }
    return { success: true, message: 'You have left this group cart.' };
  }

  const orderRef = doc(db, 'orders', orderId);
  const participantRef = doc(db, 'orders', orderId, 'participants', userId);

  await runTransaction(db, async (transaction) => {
    const oSnap = await transaction.get(orderRef);
    if (!oSnap.exists()) return;

    transaction.update(participantRef, {
      isActive: false,
      leftAt: serverTimestamp(),
    });

    const currentCount = oSnap.data().participantCount || 2;
    transaction.update(orderRef, {
      participantCount: Math.max(1, currentCount - 1),
      updatedAt: serverTimestamp(),
    });
  });

  return { success: true, message: 'You have left this group cart.' };
}

/**
 * Fetches participants of an order.
 */
export async function getOrderParticipants(orderId: string): Promise<Participant[]> {
  if (!isFirebaseConfigured) {
    return getLocalParticipants(orderId);
  }

  try {
    const participantsRef = collection(db, 'orders', orderId, 'participants');
    const snap = await getDocs(participantsRef);
    return snap.docs.map((d) => ({
      userId: d.id,
      ...d.data(),
    })) as Participant[];
  } catch {
    return getLocalParticipants(orderId);
  }
}
