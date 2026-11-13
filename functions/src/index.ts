import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Validates hostel invite code and joins user to the hostel
 */
export const joinHostelWithCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to join a hostel.'
    );
  }

  const { inviteCode } = data;
  if (!inviteCode || typeof inviteCode !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid invite code required.');
  }

  const cleanCode = inviteCode.trim().toUpperCase();

  // In pilot mode, check default hostel code
  if (cleanCode === 'HOSTEL2026') {
    const userId = context.auth.uid;
    const hostelId = 'HOSTEL_PILOT_01';

    await db.collection('users').doc(userId).set(
      {
        hostelId: hostelId,
        role: 'student',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true, hostelId, message: 'Joined Pilot Boys Hostel successfully!' };
  }

  throw new functions.https.HttpsError('not-found', 'Invalid hostel invite code.');
});

/**
 * Cloud Function to safely recalculate group subtotal and threshold state on the backend
 * whenever an item is added, updated, or removed in an order.
 */
export const onOrderItemWritten = functions.firestore
  .document('orders/{orderId}/items/{itemId}')
  .onWrite(async (change, context) => {
    const { orderId } = context.params;
    const orderRef = db.collection('orders').doc(orderId);

    return db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        return;
      }

      const orderData = orderDoc.data()!;
      // Terminal states cannot be altered
      if (['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(orderData.status)) {
        return;
      }

      // Fetch all active items for this order
      const itemsSnapshot = await transaction.get(
        orderRef.collection('items').where('isActive', '==', true)
      );

      let groupSubtotalPaise = 0;
      itemsSnapshot.forEach((doc) => {
        const item = doc.data();
        if (!item.isUnavailable && typeof item.subtotalPaise === 'number') {
          groupSubtotalPaise += item.subtotalPaise;
        }
      });

      const minimumAmountPaise = orderData.minimumAmountPaise || 0;
      let newStatus = orderData.status;

      // If order is currently OPEN or THRESHOLD_REACHED, dynamically derive state
      if (orderData.status === 'OPEN' || orderData.status === 'THRESHOLD_REACHED') {
        newStatus = groupSubtotalPaise >= minimumAmountPaise ? 'THRESHOLD_REACHED' : 'OPEN';
      }

      transaction.update(orderRef, {
        groupItemSubtotalPaise,
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
  });

