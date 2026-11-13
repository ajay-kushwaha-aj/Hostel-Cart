import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Users, Clock, ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PLATFORMS, ORDER_STATUS_CONFIG, PILOT_HOSTEL } from '@/utils/constants';
import { formatINR } from '@/utils/money';
import { calculateRemainingPaise, calculateProgressPercentage } from '@/utils/calculations';
import { GroupOrder } from '@/types/order';

interface DashboardPageProps {
  orders?: GroupOrder[];
}

// Sample orders for initial preview if none supplied
const DEMO_ORDERS: GroupOrder[] = [
  {
    id: 'demo-order-1',
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
    expiresAt: Date.now() + 1000 * 60 * 35, // 35 minutes left
    createdAt: Date.now() - 1000 * 60 * 10,
    updatedAt: Date.now(),
    description: 'Ordering milk, bread, and chips. Join in!',
  },
  {
    id: 'demo-order-2',
    title: 'Quick Fruits & Energy Drinks',
    platform: 'zepto',
    organizerId: 'u2',
    organizerName: 'Rahul (Room 210)',
    hostelId: PILOT_HOSTEL.id,
    minimumAmountPaise: 14900,
    groupItemSubtotalPaise: 16800,
    participantCount: 2,
    status: 'THRESHOLD_REACHED',
    inviteCode: 'ZEPTO-FIT',
    expiresAt: Date.now() + 1000 * 60 * 15,
    createdAt: Date.now() - 1000 * 60 * 20,
    updatedAt: Date.now(),
    description: 'Hit the target, locking soon!',
  },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ orders = DEMO_ORDERS }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
            {PILOT_HOSTEL.name}
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Hostel Group Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active quick-commerce carts in your hostel. Join or start one to save on minimum charges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/join"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Join Code</span>
          </Link>
          <Link
            to="/create"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Order</span>
          </Link>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Active Carts ({orders.length})</h2>
          <span className="text-xs text-slate-500">Live updating</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-700">No active group carts right now</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to start a group order for Blinkit, Zepto, or Swiggy Instamart and share the invite with your hostel!
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Order</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => {
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
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Platform & Status Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${platform.badgeColor}`}
                      >
                        {platform.name}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {order.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Organized by <strong className="text-slate-700">{order.organizerName}</strong>
                    </p>
                  </div>

                  {/* Progress & Target Section */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Cart Total:</span>
                      <span className="font-bold text-slate-900">
                        {formatINR(order.groupItemSubtotalPaise)}
                        <span className="text-slate-400 font-normal">
                          {' '}
                          / {formatINR(order.minimumAmountPaise)}
                        </span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>{progress}% reached</span>
                      <span>
                        {remaining > 0 ? (
                          <span className="text-amber-600 font-medium">
                            ₹{remaining / 100} needed
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Target met!
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Footer Meta & Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {order.participantCount} joined
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {minutesLeft}m left
                      </span>
                    </div>

                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <span>View Cart</span>
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
