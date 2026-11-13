import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Lock,
  Plus,
  CheckCircle2,
  Users,
  Clock,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { PLATFORMS, ORDER_STATUS_CONFIG } from '@/utils/constants';
import { formatINR } from '@/utils/money';
import {
  calculateRemainingPaise,
  calculateProgressPercentage,
} from '@/utils/calculations';
import { useOrder } from '@/hooks/useOrder';

export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const {
    order,
    participants,
    loading,
    error,
    isOrganizer,
    isParticipant,
    join,
    leave,
  } = useOrder(orderId);

  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">Loading group cart...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Cart Not Found</h2>
        <p className="text-xs text-slate-500">
          {error || 'This order does not exist or has expired.'}
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
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {participants.filter((p) => p.isActive).length} students joined
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
                Join this order to add your grocery links and pool minimums!
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
            Participants ({participants.filter((p) => p.isActive).length})
          </h2>

          <button
            onClick={() =>
              alert(
                'Phase 4 Product Management: You will be able to add manual products and verified platform links here!'
              )
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add My Products</span>
          </button>
        </div>

        {/* Participants Cards */}
        <div className="grid grid-cols-1 gap-3">
          {participants
            .filter((p) => p.isActive)
            .map((p) => (
              <div
                key={p.userId}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {p.displayName}
                      {p.userId === order.organizerId && (
                        <span className="ml-1.5 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-medium">
                          Organizer
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Items Subtotal: {formatINR(p.subtotalPaise)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    {formatINR(p.subtotalPaise)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Bottom Coordinator Footer */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
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
    </div>
  );
};
