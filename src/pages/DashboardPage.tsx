import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Users,
  Clock,
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { PLATFORMS, ORDER_STATUS_CONFIG, PILOT_HOSTEL } from '@/utils/constants';
import { formatINR } from '@/utils/money';
import { calculateRemainingPaise, calculateProgressPercentage } from '@/utils/calculations';
import { GroupOrder, PlatformId } from '@/types/order';
import { subscribeToHostelOrders } from '@/services/orderService';
import { useAuth } from '@/hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [filterTab, setFilterTab] = useState<'all' | 'needs_items' | 'target_met'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const hostelId = user?.hostelId || PILOT_HOSTEL.id;

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToHostelOrders(hostelId, (updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hostelId]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Exclude completed or cancelled from active dashboard
    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      return false;
    }

    if (selectedPlatform !== 'all' && order.platform !== selectedPlatform) {
      return false;
    }

    if (filterTab === 'needs_items' && order.status === 'THRESHOLD_REACHED') {
      return false;
    }

    if (filterTab === 'target_met' && order.status !== 'THRESHOLD_REACHED') {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.title.toLowerCase().includes(q) ||
        order.organizerName.toLowerCase().includes(q) ||
        order.platform.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-md border border-slate-700/50">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{PILOT_HOSTEL.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hostel Quick-Commerce Carts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Combine your grocery & snack needs with students in your hostel. Hit Blinkit, Zepto, or Instamart thresholds together and save delivery fees!
            </p>
          </div>

          <div className="flex sm:flex-col items-center gap-2 sm:self-center">
            <Link
              to="/create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Order</span>
            </Link>

            <Link
              to="/join"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/10 transition-all active:scale-[0.98]"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Enter Code</span>
            </Link>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-semibold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Active ({orders.length})
            </button>
            <button
              onClick={() => setFilterTab('needs_items')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterTab === 'needs_items'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Needs Items
            </button>
            <button
              onClick={() => setFilterTab('target_met')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterTab === 'target_met'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Target Met
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, student..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200/90 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Platform Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
              selectedPlatform === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>All Platforms</span>
          </button>
          {(Object.keys(PLATFORMS) as PlatformId[]).map((pKey) => {
            const p = PLATFORMS[pKey];
            const isSelected = selectedPlatform === pKey;
            return (
              <button
                key={pKey}
                onClick={() => setSelectedPlatform(pKey)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: p.themeColor }}
                />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid */}
      <div>
        {loading ? (
          <div className="min-h-[25vh] flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs">Loading live hostel carts...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-slate-900 text-base">No active carts matching filter</h3>
              <p className="text-xs text-slate-500">
                Be the first to start an order session for Blinkit, Zepto, or Instamart in your hostel!
              </p>
            </div>
            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Cart</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => {
              const platform = PLATFORMS[order.platform];
              const status = ORDER_STATUS_CONFIG[order.status];
              const progress = calculateProgressPercentage(
                order.groupItemSubtotalPaise,
                order.minimumAmountPaise
              );
              const remaining = calculateRemainingPaise(
                order.groupItemSubtotalPaise,
                order.minimumAmountPaise
              );
              const minutesLeft = Math.max(
                0,
                Math.round((order.expiresAt - Date.now()) / (1000 * 60))
              );

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:border-emerald-300/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-2.5">
                    {/* Platform & Status Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${platform.badgeColor}`}
                        >
                          {platform.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                          {order.inviteCode}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Order Title */}
                    <div>
                      <h3 className="font-black text-slate-900 text-base sm:text-lg leading-snug">
                        {order.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Organized by <strong className="text-slate-800">{order.organizerName}</strong>
                      </p>
                    </div>

                    {order.pickupNote && (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50/70 border border-emerald-100 px-2.5 py-1 rounded-xl">
                        📍 {order.pickupNote}
                      </p>
                    )}
                  </div>

                  {/* Progress & Target Section */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold">Group Item Subtotal:</span>
                      <span className="font-bold text-slate-900">
                        {formatINR(order.groupItemSubtotalPaise)}
                        <span className="text-slate-400 font-normal">
                          {' '}
                          / {formatINR(order.minimumAmountPaise)}
                        </span>
                      </span>
                    </div>

                    {/* Sleek Progress Bar */}
                    <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 100
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{progress}% towards target</span>
                      <span>
                        {remaining > 0 ? (
                          <span className="text-amber-700 font-bold">
                            ₹{remaining / 100} needed
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-extrabold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Target reached!
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Footer Meta & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {order.participantCount} joined
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {minutesLeft}m left
                      </span>
                    </div>

                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition"
                    >
                      <span>Open Cart</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
