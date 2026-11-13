/**
 * Multi-session real-time Broadcast Channel for cross-tab reactivity
 */

type BroadcastEventType =
  | 'ORDER_UPDATED'
  | 'ITEM_ADDED'
  | 'ITEM_UPDATED'
  | 'ITEM_REMOVED'
  | 'PARTICIPANT_JOINED'
  | 'PARTICIPANT_LEFT';

export interface BroadcastMessage {
  type: BroadcastEventType;
  orderId: string;
  timestamp: number;
  payload?: unknown;
}

type SyncListener = (event: BroadcastMessage) => void;

const localListeners = new Set<{ orderId: string; callback: SyncListener }>();

let channel: BroadcastChannel | null = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel('hostelcart_sync_channel');
    channel.addEventListener('message', (e: MessageEvent<BroadcastMessage>) => {
      if (e.data) {
        dispatchToLocalListeners(e.data);
      }
    });
  }
} catch {
  channel = null;
}

function dispatchToLocalListeners(msg: BroadcastMessage) {
  localListeners.forEach(({ orderId, callback }) => {
    if (orderId === msg.orderId || orderId === 'all' || msg.orderId === 'all') {
      try {
        callback(msg);
      } catch (err) {
        console.warn('Listener error:', err);
      }
    }
  });
}

export function broadcastSyncEvent(
  type: BroadcastEventType,
  orderId: string,
  payload?: unknown
): void {
  const msg: BroadcastMessage = {
    type,
    orderId,
    timestamp: Date.now(),
    payload,
  };

  // 1. Dispatch locally in the same window
  dispatchToLocalListeners(msg);

  // 2. Broadcast across other tabs via BroadcastChannel
  if (channel) {
    try {
      channel.postMessage(msg);
    } catch (e) {
      console.warn('Broadcast sync error:', e);
    }
  }
}

export function subscribeToBroadcastSync(
  orderId: string,
  callback: SyncListener
): () => void {
  const entry = { orderId, callback };
  localListeners.add(entry);

  return () => {
    localListeners.delete(entry);
  };
}
