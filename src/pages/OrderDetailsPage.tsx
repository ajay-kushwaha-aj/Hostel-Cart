import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Lock,
  Plus,
  ExternalLink,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { PLATFORMS, ORDER_STATUS_CONFIG } from '@/utils/constants';
import { formatINR } from '@/utils/money';
import {
  calculateGroupSubtotalPaise,
  calculateParticipantSubtotalPaise,
  calculateRemainingPaise,
  calculateProgressPercentage,
} from '@/utils/calculations';
import { OrderItem, GroupOrder } from '@/types/order';

const SAMPLE_ORDER: GroupOrder = {
  id: 'demo-order-1',
  title: 'Sunday Evening Snacks & Dairy',
  platform: 'blinkit',
  organizerId: 'u1',
  organizerName: 'Ajay (Room 304)',
  hostelId: 'HOSTEL_PILOT_01',
  minimumAmountPaise: 19900,
  groupItemSubtotalPaise: 14500,
  participantCount: 3,
  status: 'OPEN',
  inviteCode: 'CART-SNACK',
  expiresAt: Date.now() + 1000 * 60 * 35,
  createdAt: Date.now() - 1000 * 60 * 10,
  updatedAt: Date.now(),
  description: 'Ordering milk, bread, and chips. Join in!',
};

const SAMPLE_ITEMS: OrderItem[] = [
  {
    id: 'item-1',
    orderId: 'demo-order-1',
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
    createdAt: Date.now() - 1000 * 60 * 8,
    updatedAt: Date.now() - 1000 * 60 * 8,
  },
  {
    id: 'item-2',
    orderId: 'demo-order-1',
    userId: 'u2',
    userName: 'Rohan (Room 102)',
    productName: 'Britannia 100% Whole Wheat Bread',
    entryType: 'manual',
    quantity: 1,
    unitPricePaise: 4500,
    subtotalPaise: 4500,
    note: 'Large brown bread',
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 5,
    updatedAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'item-3',
    orderId: 'demo-order-1',
    userId: 'u3',
    userName: 'Sneha (Room 214)',
    productName: 'Lay’s India’s Magic Masala Potato Chips',
    entryType: 'manual',
    quantity: 2,
    unitPricePaise: 2300,
    subtotalPaise: 4600,
    note: 'Party pack if available',
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 2,
    updatedAt: Date.now() - 1000 * 60 * 2,
  },
];

export const OrderDetailsPage: React.FC = () => {
  const [items] = useState<OrderItem[]>(SAMPLE_ITEMS);
  const [copied, setCopied] = useState(false);

  const order = SAMPLE_ORDER;
  const platform = PLATFORMS[order.platform];
  const status = ORDER_STATUS_CONFIG[order.status];

  const currentSubtotal = calculateGroupSubtotalPaise(items);
  const remainingPaise = calculateRemainingPaise(currentSubtotal, order.minimumAmountPaise);
  const progress = calculateProgressPercentage(currentSubtotal, order.minimumAmountPaise);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(
      `Join my ${platform.name} group order on HostelCart! Code: ${order.inviteCode}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group items by participant
  const participantsMap = new Map<string, { name: string; items: OrderItem[] }>();
  items.forEach((item) => {
    if (!participantsMap.has(item.userId)) {
      participantsMap.set(item.userId, { name: item.userName, items: [] });
    }
    participantsMap.get(item.userId)!.items.push(item);
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{copied ? 'Copied Link!' : 'Share Invite'}</span>
        </button>
      </div>

      {/* Order Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${platform.badgeColor}`}
            >
              {platform.name}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium border ${status.badgeClass}`}
            >
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {participantsMap.size} participants
            </span>
            <span className="inline-flex items-center gap-1 font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              Code: {order.inviteCode}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{order.title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organized by <strong className="text-slate-700">{order.organizerName}</strong> &bull;{' '}
            {order.description}
          </p>
        </div>

        {/* Live Threshold Progress Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Group Cart Item Subtotal:</span>
            <span className="font-bold text-base text-slate-900">
              {formatINR(currentSubtotal)}
              <span className="text-xs text-slate-400 font-normal">
                {' '}
                / {formatINR(order.minimumAmountPaise)}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <span>{progress}% towards target</span>
            <span>
              {remainingPaise > 0 ? (
                <span className="text-amber-700 font-medium">
                  {formatINR(remainingPaise)} more needed
                </span>
              ) : (
                <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Minimum met! Ready for checkout
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Cart Items ({items.length})</h2>

          <button
            onClick={() => alert('Add Item modal / form activates in Phase 4!')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add My Product</span>
          </button>
        </div>

        {/* Grouped by Participant */}
        <div className="space-y-4">
          {Array.from(participantsMap.entries()).map(([userId, pData]) => {
            const pSubtotal = calculateParticipantSubtotalPaise(items, userId);

            return (
              <div
                key={userId}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Participant Header */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">{pData.name}</span>
                  <span className="text-xs font-bold text-slate-900">
                    Subtotal: {formatINR(pSubtotal)}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-100">
                  {pData.items.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/50 transition"
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{item.productName}</span>
                          {item.productURL && (
                            <a
                              href={item.productURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700"
                              title="Open original product link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {item.note && <p className="text-[11px] text-slate-500">{item.note}</p>}
                        <div className="text-[11px] text-slate-400">
                          Qty: {item.quantity} &times; {formatINR(item.unitPricePaise)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900">
                          {formatINR(item.subtotalPaise)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Organizer Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          <strong>Organizer action:</strong> Freeze cart when ready to collect payments and place order.
        </div>

        <Link
          to={`/orders/${order.id}/payments`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          <Lock className="w-4 h-4" />
          <span>Checkout & Payment Coordination</span>
        </Link>
      </div>
    </div>
  );
};
