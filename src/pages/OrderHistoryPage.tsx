import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowRight, Calendar, Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getHostelOrders } from '@/services/orderService';
import { GroupOrder } from '@/types/order';
import { PLATFORMS, ORDER_STATUS_CONFIG, PILOT_HOSTEL } from '@/utils/constants';
import { formatINR } from '@/utils/money';

export const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const hostelId = user?.hostelId || PILOT_HOSTEL.id;
        const allOrders = await getHostelOrders(hostelId);
        // History contains past or closed sessions: COMPLETED, CANCELLED, EXPIRED
        const historyOrders = allOrders.filter((o) =>
          ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(o.status)
        );
        setOrders(historyOrders);
      } catch (err) {
        console.warn('Failed to fetch order history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.hostelId]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'COMPLETED') return o.status === 'COMPLETED';
    if (filter === 'CANCELLED') return o.status === 'CANCELLED' || o.status === 'EXPIRED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order History & Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Archived and completed group orders in your hostel with finalized item splits.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold self-start">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Past ({orders.length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === 'COMPLETED'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('CANCELLED')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === 'CANCELLED'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cancelled / Expired
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <span className="text-xs font-semibold">Loading past sessions...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center space-y-4 shadow-sm">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No past orders in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once group orders reach completion and items are distributed, their receipts and fair
            share allocations will appear here.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            <span>Back to Active Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const platform = PLATFORMS[order.platform] || PLATFORMS.blinkit;
            const status = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.COMPLETED;
            const dateStr = new Date(order.completedAt || order.createdAt).toLocaleDateString(
              'en-IN',
              {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }
            );

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-black border ${platform.badgeColor}`}
                    >
                      {platform.name}
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-base line-clamp-1">
                      {order.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Organized by <strong className="text-slate-700">{order.organizerName}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Final Total
                      </span>
                      <span className="font-black text-slate-900">
                        {formatINR(order.actualCheckoutTotalPaise || order.groupItemSubtotalPaise)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Participants
                      </span>
                      <span className="font-bold text-slate-700 inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {order.participantCount} students
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {dateStr}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/orders/${order.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition text-xs"
                    >
                      View Items
                    </Link>
                    <Link
                      to={`/orders/${order.id}/payments`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition text-xs inline-flex items-center gap-1"
                    >
                      <span>Receipt</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
