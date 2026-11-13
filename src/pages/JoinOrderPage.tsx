import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowRight,
  ArrowLeft,
  Search,
  Clock,
  ShieldAlert,
  Loader2,
  ShoppingCart,
} from 'lucide-react';
import { validateInviteCode } from '@/utils/validators';
import { findOrderByInviteCode, joinGroupOrder } from '@/services/orderService';
import { PLATFORMS } from '@/utils/constants';
import { formatINR } from '@/utils/money';
import { calculateProgressPercentage } from '@/utils/calculations';
import { GroupOrder } from '@/types/order';
import { useAuth } from '@/hooks/useAuth';

export const JoinOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [code, setCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<GroupOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPreviewOrder(null);

    const validation = validateInviteCode(code);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid invite code.');
      return;
    }

    if (!user || !user.hostelId) {
      setError('You must be a member of a hostel to join orders.');
      return;
    }

    setSearching(true);
    try {
      const found = await findOrderByInviteCode(code, user.hostelId);
      setPreviewOrder(found);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No order found with this code.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmJoin = async () => {
    if (!previewOrder || !user || !user.hostelId) return;

    setJoining(true);
    setError(null);
    try {
      await joinGroupOrder(previewOrder.id, user.userId, user.displayName, user.hostelId);
      navigate(`/orders/${previewOrder.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join cart.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Join a Group Cart</h1>
          <p className="text-xs text-slate-500">
            Enter the 6-character code or link shared by your hostel-mate to view items and combine orders.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Code Input Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
              Order Invite Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CART-SNACK"
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-mono font-black tracking-widest text-xl uppercase text-slate-900"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Example active code: <code className="font-semibold text-emerald-700 font-mono">CART-SNACK</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={searching}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Finding Cart...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Cart Details</span>
              </>
            )}
          </button>
        </form>

        {/* Matching Order Preview Card */}
        {previewOrder && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    PLATFORMS[previewOrder.platform]?.badgeColor
                  }`}
                >
                  {PLATFORMS[previewOrder.platform]?.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.max(0, Math.round((previewOrder.expiresAt - Date.now()) / (1000 * 60)))}m left
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{previewOrder.title}</h3>
                <p className="text-xs text-slate-500">
                  Organized by <strong>{previewOrder.organizerName}</strong>
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-bold text-slate-800">
                    {formatINR(previewOrder.groupItemSubtotalPaise)} / {formatINR(previewOrder.minimumAmountPaise)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{
                      width: `${calculateProgressPercentage(
                        previewOrder.groupItemSubtotalPaise,
                        previewOrder.minimumAmountPaise
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmJoin}
              disabled={joining}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Joining Session...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Confirm & Join Cart</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
