import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/utils/money';
import { allocateCheckoutShares, ParticipantShareInput } from '@/utils/calculations';

const SAMPLE_PARTICIPANTS: ParticipantShareInput[] = [
  { userId: 'u1', itemSubtotalPaise: 5400 }, // Ajay ₹54
  { userId: 'u2', itemSubtotalPaise: 4500 }, // Rohan ₹45
  { userId: 'u3', itemSubtotalPaise: 4600 }, // Sneha ₹46
];

export const PaymentSummaryPage: React.FC = () => {
  const { orderId } = useParams();

  // Actual checkout charges entered by organizer
  const [deliveryChargeRupees, setDeliveryChargeRupees] = useState('25');
  const [platformFeeRupees, setPlatformFeeRupees] = useState('5');
  const [discountRupees, setDiscountRupees] = useState('0');

  const deliveryPaise = Math.round((parseFloat(deliveryChargeRupees) || 0) * 100);
  const feePaise = Math.round((parseFloat(platformFeeRupees) || 0) * 100);
  const discountPaise = Math.round((parseFloat(discountRupees) || 0) * 100);

  const sharedChargesPaise = deliveryPaise + feePaise - discountPaise;
  const itemsTotalPaise = SAMPLE_PARTICIPANTS.reduce((sum, p) => sum + p.itemSubtotalPaise, 0);
  const finalTotalPayablePaise = itemsTotalPaise + sharedChargesPaise;

  const allocations = allocateCheckoutShares(
    SAMPLE_PARTICIPANTS,
    sharedChargesPaise,
    finalTotalPayablePaise
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to={`/orders/${orderId || 'demo-order-1'}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
            Checkout Coordination
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Payment & Allocation Summary</h1>
          <p className="text-xs text-slate-500 mt-1">
            Proportional split of actual delivery and handling charges among participants.
          </p>
        </div>

        {/* Organizer Checkout Adjustments Form */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Actual Platform Charges (Entered by Organizer)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Delivery Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={deliveryChargeRupees}
                onChange={(e) => setDeliveryChargeRupees(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Handling/Platform Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={platformFeeRupees}
                onChange={(e) => setPlatformFeeRupees(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Platform Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={discountRupees}
                onChange={(e) => setDiscountRupees(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-emerald-700"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>
              Net shared adjustments:{' '}
              <strong className="text-slate-800">{formatINR(sharedChargesPaise)}</strong>
            </span>
            <span>
              Final checkout amount:{' '}
              <strong className="text-slate-900">{formatINR(finalTotalPayablePaise)}</strong>
            </span>
          </div>
        </div>

        {/* Participant Allocations Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Fair Share Breakdown
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2.5 font-semibold text-slate-700 grid grid-cols-4">
              <span>Participant</span>
              <span className="text-right">Items</span>
              <span className="text-right">Shared Fee</span>
              <span className="text-right">Total Payable</span>
            </div>

            <div className="divide-y divide-slate-100">
              {allocations.map((alloc, idx) => (
                <div key={alloc.userId} className="px-4 py-3 grid grid-cols-4 items-center">
                  <div className="font-medium text-slate-900">
                    {alloc.userId === 'u1' ? 'Ajay (Organizer)' : `Participant ${idx + 1}`}
                  </div>
                  <div className="text-right text-slate-600">
                    {formatINR(alloc.itemSubtotalPaise)}
                  </div>
                  <div className="text-right text-slate-600">
                    +{formatINR(alloc.allocatedFeePaise)}
                  </div>
                  <div className="text-right font-bold text-slate-900">
                    {formatINR(alloc.totalPayablePaise)}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900 grid grid-cols-4 border-t border-slate-200">
              <span>Total</span>
              <span className="text-right">{formatINR(itemsTotalPaise)}</span>
              <span className="text-right">+{formatINR(sharedChargesPaise)}</span>
              <span className="text-right text-emerald-700">
                {formatINR(finalTotalPayablePaise)}
              </span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>External Payment Instructions</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Participants must pay the organizer directly via UPI (Google Pay, PhonePe, Paytm). HostelCart tracks reported payment status without processing or holding money.
          </p>
        </div>
      </div>
    </div>
  );
};
