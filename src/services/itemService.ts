import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { OrderItem, GroupOrder } from '../types/order';
import { ManualItemInput, UrlItemInput } from '../types/product';
import {
  validateProductUrl,
  validateQuantity,
  validateUnitPriceRupees,
} from '../utils/validators';
import {
  calculateItemSubtotalPaise,
  calculateGroupSubtotalPaise,
  calculateParticipantSubtotalPaise,
} from '../utils/calculations';
import { getOrderById } from './orderService';
import { broadcastSyncEvent, subscribeToBroadcastSync } from './broadcastService';

const LOCAL_STORAGE_ITEMS_KEY = 'hostelcart_mock_items';

function getLocalItems(orderId: string): OrderItem[] {
  const key = `${LOCAL_STORAGE_ITEMS_KEY}_${orderId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    if (orderId === 'order_demo_1') {
      const initial: OrderItem[] = [
        {
          id: 'item_d1',
          orderId: 'order_demo_1',
          userId: 'u1',
          userName: 'Ajay (Organizer)',
          productName: 'Amul Taaza Homogenised Toned Milk 1L',
          productURL: 'https://blinkit.com/prn/amul-taaza/prid/12345',
          entryType: 'url',
          quantity: 1,
          unitPricePaise: 5400,
          subtotalPaise: 5400,
          note: 'Toned 1L pack',
          isActive: true,
          isUnavailable: false,
          createdAt: Date.now() - 1000 * 60 * 12,
          updatedAt: Date.now() - 1000 * 60 * 12,
        },
        {
          id: 'item_d2',
          orderId: 'order_demo_1',
          userId: 'u2',
          userName: 'Rohan (Room 102)',
          productName: 'Britannia 100% Whole Wheat Bread 400g',
          entryType: 'manual',
          quantity: 1,
          unitPricePaise: 4500,
          subtotalPaise: 4500,
          note: 'Fresh brown bread',
          isActive: true,
          isUnavailable: false,
          createdAt: Date.now() - 1000 * 60 * 8,
          updatedAt: Date.now() - 1000 * 60 * 8,
        },
        {
          id: 'item_d3',
          orderId: 'order_demo_1',
          userId: 'u3',
          userName: 'Sneha (Room 214)',
          productName: 'Lay’s India’s Magic Masala Potato Chips',
          entryType: 'manual',
          quantity: 2,
          unitPricePaise: 2300,
          subtotalPaise: 4600,
          note: 'Large party pack',
          isActive: true,
          isUnavailable: false,
          createdAt: Date.now() - 1000 * 60 * 4,
          updatedAt: Date.now() - 1000 * 60 * 4,
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

function saveLocalItems(orderId: string, items: OrderItem[]): void {
  const key = `${LOCAL_STORAGE_ITEMS_KEY}_${orderId}`;
  localStorage.setItem(key, JSON.stringify(items));
}

// Helper to recalculate local order totals and derived status
function updateLocalOrderSubtotals(orderId: string, items: OrderItem[]): void {
  const storedOrders = localStorage.getItem('hostelcart_mock_orders');
  if (!storedOrders) return;

  try {
    const orders: GroupOrder[] = JSON.parse(storedOrders);
    const orderIdx = orders.findIndex((o) => o.id === orderId);
    if (orderIdx === -1) return;

    const order = orders[orderIdx];
    const newGroupSubtotal = calculateGroupSubtotalPaise(items);
    order.groupItemSubtotalPaise = newGroupSubtotal;
    order.updatedAt = Date.now();

    // Derived threshold status (PRD Section 8 & 9.2)
    if (order.status === 'OPEN' || order.status === 'THRESHOLD_REACHED') {
      order.status =
        newGroupSubtotal >= order.minimumAmountPaise ? 'THRESHOLD_REACHED' : 'OPEN';
    }

    localStorage.setItem('hostelcart_mock_orders', JSON.stringify(orders));

    // Also update participant subtotal records
    const pKey = `hostelcart_mock_participants_${orderId}`;
    const storedP = localStorage.getItem(pKey);
    if (storedP) {
      const participants = JSON.parse(storedP);
      participants.forEach((p: { userId: string; subtotalPaise: number }) => {
        p.subtotalPaise = calculateParticipantSubtotalPaise(items, p.userId);
      });
      localStorage.setItem(pKey, JSON.stringify(participants));
    }
  } catch {
    // Ignore
  }
}

export type AddItemInput =
  | ({ entryType: 'manual' } & ManualItemInput)
  | ({ entryType: 'url' } & UrlItemInput);

/**
 * Adds a new product item to a group order (manual or URL entry).
 */
export async function addProductItem(
  orderId: string,
  userId: string,
  userName: string,
  input: AddItemInput
): Promise<OrderItem> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  // Security & lifecycle check: order must be open
  if (!['OPEN', 'THRESHOLD_REACHED'].includes(order.status)) {
    throw new Error(`Cannot add items: Order is ${order.status.toLowerCase().replace('_', ' ')}.`);
  }

  if (Date.now() > order.expiresAt) {
    throw new Error('Cannot add items: Order deadline has passed.');
  }

  // Validate fields
  if (!input.productName.trim()) {
    throw new Error('Product name is required.');
  }

  const qtyCheck = validateQuantity(input.quantity);
  if (!qtyCheck.isValid) {
    throw new Error(qtyCheck.error || 'Invalid quantity.');
  }

  const priceCheck = validateUnitPriceRupees(input.unitPriceRupees);
  if (!priceCheck.isValid) {
    throw new Error(priceCheck.error || 'Invalid unit price.');
  }

  // Validate URL if URL entry
  if (input.entryType === 'url') {
    const urlCheck = validateProductUrl(input.productURL, order.platform);
    if (!urlCheck.isValid) {
      throw new Error(urlCheck.error || 'Invalid product URL.');
    }
  }

  const unitPricePaise = Math.round(input.unitPriceRupees * 100);
  const subtotalPaise = calculateItemSubtotalPaise(input.quantity, unitPricePaise);
  const itemId = 'item_' + Math.random().toString(36).substring(2, 9);
  const now = Date.now();

  const newItem: OrderItem = {
    id: itemId,
    orderId,
    userId,
    userName,
    productName: input.productName.trim(),
    productURL: input.entryType === 'url' ? input.productURL.trim() : null,
    entryType: input.entryType,
    quantity: input.quantity,
    unitPricePaise,
    subtotalPaise,
    note: input.note?.trim() || null,
    isActive: true,
    isUnavailable: false,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured) {
    const items = getLocalItems(orderId);
    items.push(newItem);
    saveLocalItems(orderId, items);
    updateLocalOrderSubtotals(orderId, items);
    broadcastSyncEvent('ITEM_ADDED', orderId, newItem);
    return newItem;
  }

  // Real Firebase mode with transaction
  const orderRef = doc(db, 'orders', orderId);
  const itemRef = doc(db, 'orders', orderId, 'items', itemId);
  const participantRef = doc(db, 'orders', orderId, 'participants', userId);

  await runTransaction(db, async (transaction) => {
    const oSnap = await transaction.get(orderRef);
    if (!oSnap.exists()) throw new Error('Order does not exist.');

    const oData = oSnap.data();
    if (!['OPEN', 'THRESHOLD_REACHED'].includes(oData.status)) {
      throw new Error('Order is not open for modifications.');
    }

    transaction.set(itemRef, {
      ...newItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update order subtotal atomically
    const newGroupSubtotal = (oData.groupItemSubtotalPaise || 0) + subtotalPaise;
    const isMet = newGroupSubtotal >= (oData.minimumAmountPaise || 0);

    transaction.update(orderRef, {
      groupItemSubtotalPaise: newGroupSubtotal,
      status: isMet ? 'THRESHOLD_REACHED' : 'OPEN',
      updatedAt: serverTimestamp(),
    });

    // Update participant subtotal atomically
    const pSnap = await transaction.get(participantRef);
    if (pSnap.exists()) {
      const currentSubtotal = pSnap.data().subtotalPaise || 0;
      transaction.update(participantRef, {
        subtotalPaise: currentSubtotal + subtotalPaise,
      });
    }
  });

  return newItem;
}

/**
 * Updates an existing order item. Only the owner can edit while order is open.
 */
export async function updateProductItem(
  orderId: string,
  itemId: string,
  userId: string,
  updates: {
    productName?: string;
    quantity?: number;
    unitPriceRupees?: number;
    note?: string | null;
  }
): Promise<OrderItem> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found.');

  if (!['OPEN', 'THRESHOLD_REACHED'].includes(order.status)) {
    throw new Error('Cannot edit item: Cart is frozen or placed.');
  }

  if (!isFirebaseConfigured) {
    const items = getLocalItems(orderId);
    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) throw new Error('Item not found.');

    const currentItem = items[itemIndex];
    if (currentItem.userId !== userId && order.organizerId !== userId) {
      throw new Error('You can only edit your own items.');
    }

    if (updates.quantity !== undefined) {
      const qtyCheck = validateQuantity(updates.quantity);
      if (!qtyCheck.isValid) throw new Error(qtyCheck.error);
      currentItem.quantity = updates.quantity;
    }

    if (updates.unitPriceRupees !== undefined) {
      const priceCheck = validateUnitPriceRupees(updates.unitPriceRupees);
      if (!priceCheck.isValid) throw new Error(priceCheck.error);
      currentItem.unitPricePaise = Math.round(updates.unitPriceRupees * 100);
    }

    if (updates.productName !== undefined && updates.productName.trim()) {
      currentItem.productName = updates.productName.trim();
    }

    if (updates.note !== undefined) {
      currentItem.note = updates.note?.trim() || null;
    }

    currentItem.subtotalPaise = calculateItemSubtotalPaise(
      currentItem.quantity,
      currentItem.unitPricePaise
    );
    currentItem.updatedAt = Date.now();

    items[itemIndex] = currentItem;
    saveLocalItems(orderId, items);
    updateLocalOrderSubtotals(orderId, items);
    broadcastSyncEvent('ITEM_UPDATED', orderId, currentItem);
    return currentItem;
  }

  // Real Firebase mode
  const itemRef = doc(db, 'orders', orderId, 'items', itemId);

  let updatedItemResult: OrderItem;

  await runTransaction(db, async (transaction) => {
    const iSnap = await transaction.get(itemRef);
    if (!iSnap.exists()) throw new Error('Item does not exist.');

    const iData = iSnap.data() as OrderItem;
    if (iData.userId !== userId) {
      throw new Error('You can only edit your own items.');
    }

    const newQty = updates.quantity !== undefined ? updates.quantity : iData.quantity;
    const newPricePaise =
      updates.unitPriceRupees !== undefined
        ? Math.round(updates.unitPriceRupees * 100)
        : iData.unitPricePaise;
    const newSubtotal = calculateItemSubtotalPaise(newQty, newPricePaise);

    const merged = {
      ...iData,
      productName: updates.productName?.trim() || iData.productName,
      quantity: newQty,
      unitPricePaise: newPricePaise,
      subtotalPaise: newSubtotal,
      note: updates.note !== undefined ? updates.note : iData.note,
      updatedAt: serverTimestamp(),
    };

    transaction.update(itemRef, merged);
    updatedItemResult = { ...merged, updatedAt: Date.now() };
  });

  return updatedItemResult!;
}

/**
 * Removes or deactivates an order item.
 */
export async function removeProductItem(
  orderId: string,
  itemId: string,
  userId: string
): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found.');

  if (!['OPEN', 'THRESHOLD_REACHED'].includes(order.status)) {
    throw new Error('Cannot remove item: Cart is frozen or placed.');
  }

  if (!isFirebaseConfigured) {
    const items = getLocalItems(orderId);
    const targetIdx = items.findIndex((i) => i.id === itemId);
    if (targetIdx === -1) throw new Error('Item not found.');

    const target = items[targetIdx];
    if (target.userId !== userId && order.organizerId !== userId) {
      throw new Error('You can only remove your own items.');
    }

    // Mark inactive / remove
    items.splice(targetIdx, 1);
    saveLocalItems(orderId, items);
    updateLocalOrderSubtotals(orderId, items);
    broadcastSyncEvent('ITEM_REMOVED', orderId, { itemId });
    return;
  }

  const itemRef = doc(db, 'orders', orderId, 'items', itemId);

  await runTransaction(db, async (transaction) => {
    const iSnap = await transaction.get(itemRef);
    if (!iSnap.exists()) throw new Error('Item does not exist.');

    const iData = iSnap.data();
    if (iData.userId !== userId && order.organizerId !== userId) {
      throw new Error('You can only remove your own items.');
    }

    transaction.delete(itemRef);
  });
}

/**
 * Organizer action: marks an item unavailable (e.g. during checkout in platform app).
 */
export async function toggleItemUnavailable(
  orderId: string,
  itemId: string,
  organizerId: string
): Promise<boolean> {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found.');

  if (order.organizerId !== organizerId) {
    throw new Error('Only the organizer can mark items unavailable.');
  }

  if (!isFirebaseConfigured) {
    const items = getLocalItems(orderId);
    const target = items.find((i) => i.id === itemId);
    if (!target) throw new Error('Item not found.');

    target.isUnavailable = !target.isUnavailable;
    target.updatedAt = Date.now();
    saveLocalItems(orderId, items);
    updateLocalOrderSubtotals(orderId, items);
    broadcastSyncEvent('ITEM_UPDATED', orderId, { itemId });
    return target.isUnavailable;
  }

  const itemRef = doc(db, 'orders', orderId, 'items', itemId);
  let nowUnavailable = false;

  await runTransaction(db, async (transaction) => {
    const iSnap = await transaction.get(itemRef);
    if (!iSnap.exists()) throw new Error('Item not found.');
    nowUnavailable = !iSnap.data().isUnavailable;
    transaction.update(itemRef, {
      isUnavailable: nowUnavailable,
      updatedAt: serverTimestamp(),
    });
  });

  return nowUnavailable;
}

/**
 * Fetches all items of an order.
 */
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  if (!isFirebaseConfigured) {
    return getLocalItems(orderId);
  }

  try {
    const itemsRef = collection(db, 'orders', orderId, 'items');
    const q = query(itemsRef, where('isActive', '==', true), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as OrderItem[];
  } catch {
    return getLocalItems(orderId);
  }
}

/**
 * Subscribes to items of an order in real-time.
 */
export function subscribeToOrderItems(
  orderId: string,
  callback: (items: OrderItem[]) => void
): () => void {
  if (!isFirebaseConfigured) {
    callback(getLocalItems(orderId));
    const handleStorage = () => {
      callback(getLocalItems(orderId));
    };
    window.addEventListener('storage', handleStorage);
    const unsubBroadcast = subscribeToBroadcastSync(orderId, () => {
      callback(getLocalItems(orderId));
    });
    return () => {
      window.removeEventListener('storage', handleStorage);
      unsubBroadcast();
    };
  }

  try {
    const itemsRef = collection(db, 'orders', orderId, 'items');
    const q = query(itemsRef, where('isActive', '==', true), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toMillis?.() || Date.now(),
        updatedAt: d.data().updatedAt?.toMillis?.() || Date.now(),
      })) as OrderItem[];
      callback(items);
    });
  } catch {
    callback(getLocalItems(orderId));
    return () => {};
  }
}
