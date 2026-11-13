import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Lock,
  Plus,
  ExternalLink,
  CheckCircle2,
  Users,
  Clock,
  Loader2,
  AlertCircle,
  Check,
  Edit2,
  Trash2,
  Ban,
  PackageOpen,
} from 'lucide-react';
import { PLATFORMS, ORDER_STATUS_CONFIG } from '@/utils/constants';
import { formatINR } from '@/utils/money';
import {
  calculateRemainingPaise,
  calculateProgressPercentage,
  calculateParticipantSubtotalPaise,
} from '@/utils/calculations';
import { OrderItem } from '@/types/order';
import { useOrder } from '@/hooks/useOrder';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToOrderItems, removeProductItem, toggleItemUnavailable } from '@/services/itemService';
import { AddItemModal } from '@/components/products/AddItemModal';
import { EditItemModal } from '@/components/products/EditItemModal';
import { ConnectionStatusBadge } from '@/components/common/ConnectionStatusBadge';

export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    order,
    participants,
    loading: orderLoading,
    error: orderError,
    isOrganizer,
    isParticipant,
    join,
    leave,
    refresh,
  } = useOrder(orderId);

  // Items State
  const [items, setItems] = useState<OrderItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);

  // Actions
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Subscribe to real-time order items
  useEffect(() => {
    if (!orderId) return;
    setItemsLoading(true);
    const unsubscribe = subscribeToOrderItems(orderId, (fetchedItems) => {
      setItems(fetchedItems);
      setItemsLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (orderLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">Loading group cart...</span>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Cart Not Found</h2>
        <p className="text-xs text-slate-500">
          {orderError || 'This order does not exist or has expired.'}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const platform = PLATFORMS[order.platform] || PLATFORMS.blinkit;
  const status = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.OPEN;
  const progress = calculateProgressPercentage(
    order.groupItemSubtotalPaise,
    order.minimumAmountPaise
  );
  const remainingPaise = calculateRemainingPaise(
    order.groupItemSubtotalPaise,
    order.minimumAmountPaise
  );
  const minutesLeft = Math.max(0, Math.round((order.expiresAt - Date.now()) / (1000 * 60)));
  const isCartEditable = ['OPEN', 'THRESHOLD_REACHED'].includes(order.status) && minutesLeft > 0;

  const handleCopyInvite = () => {
    const inviteText = `Join my ${platform.name} group cart on HostelCart! Code: ${order.inviteCode}`;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinOrder = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await join();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveOrder = async () => {
    if (!window.confirm('Are you sure you want to leave this group order?')) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await leave();
      navigate('/dashboard');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Remove this product from the group cart?')) return;
    try {
      if (!user) return;
      await removeProductItem(order.id, itemId, user.userId);
      await refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete item.');
    }
  };

  const handleToggleUnavailable = async (itemId: string) => {
    if (!user) return;
    try {
      await toggleItemUnavailable(order.id, itemId, user.userId);
      await refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update item availability.');
    }
  };

  // Group items by participant
  const activeParticipants = participants.filter((p) => p.isActive);
  const participantsMap = new Map<string, { name: string; items: OrderItem[] }>();

  // Ensure all registered participants exist in map
  activeParticipants.forEach((p) => {
    participantsMap.set(p.userId, { name: p.displayName, items: [] });
  });

  // Assign items to participants
  items.forEach((item) => {
    if (!participantsMap.has(item.userId)) {
      participantsMap.set(item.userId, { name: item.userName, items: [] });
    }
    participantsMap.get(item.userId)!.items.push(item);
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={handleCopyInvite}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied Link!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share Code: {order.inviteCode}</span>
            </>
          )}
        </button>
      </div>

      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-black border ${platform.badgeColor}`}
            >
              {platform.name}
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold border ${status.badgeClass}`}
            >
              {status.label}
            </span>
            <ConnectionStatusBadge compact />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {activeParticipants.length} students joined
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {minutesLeft}m left
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {order.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organized by <strong className="text-slate-800">{order.organizerName}</strong>
            {order.description && <span> &bull; {order.description}</span>}
          </p>
        </div>

        {order.pickupNote && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
            <span className="font-bold">📍 Pickup Location:</span>
            <span>{order.pickupNote}</span>
          </div>
        )}

        {/* Live Threshold Progress Card */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-slate-700">Combined Cart Item Subtotal:</span>
            <span className="font-black text-slate-900 text-base sm:text-lg">
              {formatINR(order.groupItemSubtotalPaise)}
              <span className="text-xs text-slate-400 font-normal">
                {' '}
                / {formatINR(order.minimumAmountPaise)} target
              </span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress >= 100
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
            <span>{progress}% towards target</span>
            <span>
              {remainingPaise > 0 ? (
                <span className="text-amber-800 font-bold">
                  {formatINR(remainingPaise)} more needed
                </span>
              ) : (
                <span className="text-emerald-700 font-black inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Threshold reached! Free delivery eligible
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Join / Leave Quick Action Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {isOrganizer ? (
              <span className="font-semibold text-emerald-700">
                You are the organizer of this group cart.
              </span>
            ) : isParticipant ? (
              <span className="font-semibold text-slate-700">
                You are an active participant in this cart.
              </span>
            ) : (
              <span className="text-slate-500">
                Join this order to add your grocery items!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isParticipant && !isOrganizer && (
              <button
                type="button"
                onClick={handleJoinOrder}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? 'Joining...' : 'Join This Cart'}
              </button>
            )}

            {isParticipant && !isOrganizer && (
              <button
                type="button"
                onClick={handleLeaveOrder}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
              >
                Leave Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Participants & Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Cart Items ({items.length})
          </h2>

          {isCartEditable && (
            <button
              onClick={() => {
                if (!isParticipant && !isOrganizer) {
                  alert('Please click "Join This Cart" above before adding products.');
                  return;
                }
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Products</span>
            </button>
          )}
        </div>

        {itemsLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <span>Loading cart items...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <PackageOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Cart is currently empty</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to add snacks, milk, or grocery links to this order!
            </p>
            {isCartEditable && (
              <button
                onClick={() => {
                  if (!isParticipant && !isOrganizer) {
                    alert('Please click "Join This Cart" first.');
                    return;
                  }
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Item</span>
              </button>
            )}
          </div>
        ) : (
          /* Grouped by Participant */
          <div className="space-y-4">
            {Array.from(participantsMap.entries()).map(([pUserId, pData]) => {
              const pSubtotal = calculateParticipantSubtotalPaise(items, pUserId);
              const isCurrentUser = user?.userId === pUserId;

              return (
                <div
                  key={pUserId}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs"
                >
                  {/* Participant Header */}
                  <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        {pData.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-slate-800">
                        {pData.name}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            You
                          </span>
                        )}
                      </span>
                    </div>

                    <span className="text-xs font-black text-slate-900">
                      Subtotal: {formatINR(pSubtotal)}
                    </span>
                  </div>

                  {/* Items List */}
                  {pData.items.length === 0 ? (
                    <div className="px-5 py-4 text-xs text-slate-400 italic">
                      No items added yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {pData.items.map((item) => {
                        const canModify =
                          isCartEditable &&
                          (item.userId === user?.userId || order.organizerId === user?.userId);

                        return (
                          <div
                            key={item.id}
                            className={`px-5 py-3.5 flex items-center justify-between gap-4 text-xs transition ${
                              item.isUnavailable
                                ? 'bg-amber-50/40 opacity-70'
                                : 'hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold text-sm ${
                                    item.isUnavailable
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {item.productName}
                                </span>

                                {item.entryType === 'url' && item.productURL && (
                                  <a
                                    href={item.productURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-emerald-600 hover:text-emerald-700 rounded transition"
                                    title="Open product in store"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                {item.isUnavailable && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                    Unavailable at checkout
                                  </span>
                                )}
                              </div>

                              {item.note && (
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {item.note}
                                </p>
                              )}

                              <div className="text-[11px] text-slate-400">
                                {item.quantity} &times; {formatINR(item.unitPricePaise)}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span
                                  className={`font-black text-sm ${
                                    item.isUnavailable ? 'text-slate-400' : 'text-slate-900'
                                  }`}
                                >
                                  {formatINR(item.subtotalPaise)}
                                </span>
                              </div>

                              {/* Edit & Delete Action Buttons */}
                              {canModify && (
                                <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                                  <button
                                    onClick={() => setEditingItem(item)}
                                    title="Edit Item"
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    title="Remove Item"
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              {/* Organizer Mark Unavailable Toggle */}
                              {isOrganizer && (
                                <button
                                  onClick={() => handleToggleUnavailable(item.id)}
                                  title={
                                    item.isUnavailable
                                      ? 'Mark available'
                                      : 'Mark unavailable at checkout'
                                  }
                                  className={`p-1.5 rounded-lg transition ${
                                    item.isUnavailable
                                      ? 'text-amber-600 bg-amber-100/60'
                                      : 'text-slate-300 hover:text-amber-600 hover:bg-amber-50'
                                  }`}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Coordinator Footer */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-xs text-slate-500 max-w-md">
          <strong>Organizer Note:</strong> When the threshold is reached, freeze the cart to coordinate external payments and checkout.
        </div>

        <Link
          to={`/orders/${order.id}/payments`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
        >
          <Lock className="w-4 h-4" />
          <span>Checkout & Payment Summary</span>
        </Link>
      </div>

      {/* Add Item Modal */}
      {user && (
        <AddItemModal
          orderId={order.id}
          platform={order.platform}
          userId={user.userId}
          userName={user.displayName}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onItemAdded={refresh}
        />
      )}

      {/* Edit Item Modal */}
      {user && editingItem && (
        <EditItemModal
          item={editingItem}
          userId={user.userId}
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          onItemUpdated={refresh}
        />
      )}
    </div>
  );
};
