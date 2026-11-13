import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Loader2,
  CreditCard,
  Ban,
} from 'lucide-react';
import { formatINR } from '@/utils/money';
import { allocateCheckoutShares } from '@/utils/calculations';
import { ORDER_STATUS_CONFIG } from '@/utils/constants';
import { OrderItem, OrderStatus, PaymentStatus, PaymentRecord, AdjustmentRecord } from '@/types/order';
import { useOrder } from '@/hooks/useOrder';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToOrderItems } from '@/services/itemService';
import {
  finalizeCheckoutAllocations,
  reportParticipantPayment,
  updateParticipantPaymentStatus,
  transitionOrderStatus,
  subscribeToOrderAdjustments,
  subscribeToOrderPayments,
} from '@/services/paymentService';
import { ConnectionStatusBadge } from '@/components/common/ConnectionStatusBadge';

export const PaymentSummaryPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { order, participants, loading: orderLoading, error: orderError, isOrganizer, refresh } =
    useOrder(orderId);

  // Items for real-time subtotals
  const [items, setItems] = useState<OrderItem[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Charges input state
  const [deliveryChargeRupees, setDeliveryChargeRupees] = useState('25');
  const [platformFeeRupees, setPlatformFeeRupees] = useState('5');
  const [taxesRupees, setTaxesRupees] = useState('0');
  const [discountRupees, setDiscountRupees] = useState('0');

  // Participant payment reporting
  const [paymentReference, setPaymentReference] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Async state
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  // Real-time subscriptions
  useEffect(() => {
    if (!orderId) return;

    const unsubItems = subscribeToOrderItems(orderId, setItems);
    const unsubAdj = subscribeToOrderAdjustments(orderId, (adjs) => {
      setAdjustments(adjs);
      // Pre-fill inputs if adjustments exist
      const del = adjs.find((a) => a.type === 'DELIVERY_CHARGE');
      const fee = adjs.find((a) => a.type === 'PLATFORM_FEE');
      const tax = adjs.find((a) => a.type === 'TAX');
      const disc = adjs.find((a) => a.type === 'DISCOUNT');
      if (del) setDeliveryChargeRupees(String(del.amountPaise / 100));
      if (fee) setPlatformFeeRupees(String(fee.amountPaise / 100));
      if (tax) setTaxesRupees(String(tax.amountPaise / 100));
      if (disc) setDiscountRupees(String(Math.abs(disc.amountPaise) / 100));
    });
    const unsubPay = subscribeToOrderPayments(orderId, setPayments);

    return () => {
      unsubItems();
      unsubAdj();
      unsubPay();
    };
  }, [orderId]);

  if (orderLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">Loading payment summary...</span>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
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

  // Active participants and calculations
  const activeParticipants = participants.filter((p) => p.isActive);

  // Compute live subtotal per participant from real items
  const participantSubtotals = activeParticipants.map((p) => {
    const userItems = items.filter(
      (item) => item.userId === p.userId && item.isActive && !item.isUnavailable
    );
    const calculatedSubtotal = userItems.reduce((sum, item) => sum + item.subtotalPaise, 0);
    // fallback to p.subtotalPaise if items haven't loaded yet
    const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : p.subtotalPaise;
    return {
      userId: p.userId,
      displayName: p.displayName,
      itemSubtotalPaise: subtotal,
      paymentStatus: p.paymentStatus,
    };
  });

  const deliveryPaise = Math.round((parseFloat(deliveryChargeRupees) || 0) * 100);
  const feePaise = Math.round((parseFloat(platformFeeRupees) || 0) * 100);
  const taxPaise = Math.round((parseFloat(taxesRupees) || 0) * 100);
  const discountPaise = Math.round((parseFloat(discountRupees) || 0) * 100);

  const sharedChargesPaise = deliveryPaise + feePaise + taxPaise - discountPaise;
  const itemsTotalPaise = participantSubtotals.reduce((sum, p) => sum + p.itemSubtotalPaise, 0);
  const finalTotalPayablePaise = Math.max(0, itemsTotalPaise + sharedChargesPaise);

  // Dynamic proportional share allocation with exact remainder distribution
  const allocationInputs = participantSubtotals.map((p) => ({
    userId: p.userId,
    itemSubtotalPaise: p.itemSubtotalPaise,
  }));

  const allocations = allocateCheckoutShares(
    allocationInputs,
    sharedChargesPaise,
    finalTotalPayablePaise
  );

  // Current user's allocation
  const currentUserAlloc = allocations.find((a) => a.userId === user?.userId);
  const currentUserPart = activeParticipants.find((p) => p.userId === user?.userId);

  // Simulated organizer UPI ID
  const organizerUpiId = `${order.organizerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(organizerUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Organizer saves checkout adjustments
  const handleSaveAllocations = async () => {
    if (!user) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await finalizeCheckoutAllocations(order.id, user.userId, {
        deliveryChargeRupees: parseFloat(deliveryChargeRupees) || 0,
        platformFeeRupees: parseFloat(platformFeeRupees) || 0,
        taxesRupees: parseFloat(taxesRupees) || 0,
        discountRupees: parseFloat(discountRupees) || 0,
      });
      await refresh();
      setFeedbackMessage({ text: 'Actual checkout charges & fair shares saved successfully!' });
    } catch (err: unknown) {
      setFeedbackMessage({
        text: err instanceof Error ? err.message : 'Failed to save checkout charges.',
        isError: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Participant reports UPI payment
  const handleReportPayment = async () => {
    if (!user || !currentUserAlloc) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await reportParticipantPayment(
        order.id,
        user.userId,
        user.displayName,
        currentUserAlloc.totalPayablePaise,
        paymentReference
      );
      setPaymentReference('');
      await refresh();
      setFeedbackMessage({
        text: 'Payment reported successfully! Organizer will confirm once received.',
      });
    } catch (err: unknown) {
      setFeedbackMessage({
        text: err instanceof Error ? err.message : 'Failed to report payment.',
        isError: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Organizer verifies participant payment status
  const handleUpdatePaymentStatus = async (targetUserId: string, newStatus: PaymentStatus) => {
    if (!user) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await updateParticipantPaymentStatus(order.id, user.userId, targetUserId, newStatus);
      await refresh();
      setFeedbackMessage({ text: `Participant payment status updated to ${newStatus}.` });
    } catch (err: unknown) {
      setFeedbackMessage({
        text: err instanceof Error ? err.message : 'Failed to update payment status.',
        isError: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Order status transition
  const handleTransitionStatus = async (newStatus: OrderStatus) => {
    if (!user) return;
    if (!window.confirm(`Transition order to ${newStatus}?`)) return;
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      await transitionOrderStatus(order.id, user.userId, newStatus);
      await refresh();
      setFeedbackMessage({ text: `Order status moved to ${newStatus}.` });
    } catch (err: unknown) {
      setFeedbackMessage({
        text: err instanceof Error ? err.message : 'Failed to update order status.',
        isError: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.OPEN;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Details</span>
        </Link>
        <ConnectionStatusBadge compact />
      </div>

      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 shadow-2xs ${
            feedbackMessage.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[11px] underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Order Header Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Checkout & Settlement
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {order.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organized by <strong className="text-slate-800">{order.organizerName}</strong> &bull;{' '}
              {activeParticipants.length} active participants
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold border ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Organizer State Lifecycle Control Bar */}
        {isOrganizer && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Lifecycle Controls
              </span>
              <span className="text-[11px] text-slate-500">Current: {order.status}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {order.status === 'LOCKED' && (
                <button
                  onClick={() => handleTransitionStatus('PAYMENT_PENDING')}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-2xs transition disabled:opacity-50"
                >
                  1. Request Participant Payments
                </button>
              )}

              {['LOCKED', 'PAYMENT_PENDING'].includes(order.status) && (
                <button
                  onClick={() => handleTransitionStatus('READY_FOR_CHECKOUT')}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-2xs transition disabled:opacity-50"
                >
                  2. Ready for Checkout
                </button>
              )}

              {order.status === 'READY_FOR_CHECKOUT' && (
                <button
                  onClick={() => handleTransitionStatus('PLACED')}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition disabled:opacity-50"
                >
                  3. Mark Order Placed on Store
                </button>
              )}

              {order.status === 'PLACED' && (
                <button
                  onClick={() => handleTransitionStatus('COMPLETED')}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition disabled:opacity-50"
                >
                  4. Mark Completed & Delivered
                </button>
              )}

              {['LOCKED', 'PAYMENT_PENDING', 'READY_FOR_CHECKOUT'].includes(order.status) && (
                <button
                  onClick={() => handleTransitionStatus('CANCELLED')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition disabled:opacity-50 ml-auto"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}

        {/* Organizer Platform Checkout Adjustments Form */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Actual Quick Commerce Charges
              </h3>
              <p className="text-[11px] text-slate-500">
                Enter delivery fee and small cart charges from the actual store checkout screen.
              </p>
            </div>
            {isOrganizer && (
              <button
                type="button"
                onClick={handleSaveAllocations}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save & Distribute'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Delivery Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                disabled={!isOrganizer}
                value={deliveryChargeRupees}
                onChange={(e) => setDeliveryChargeRupees(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Platform/Handling Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                disabled={!isOrganizer}
                value={platformFeeRupees}
                onChange={(e) => setPlatformFeeRupees(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Taxes / Surges (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                disabled={!isOrganizer}
                value={taxesRupees}
                onChange={(e) => setTaxesRupees(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Store Coupon Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                disabled={!isOrganizer}
                value={discountRupees}
                onChange={(e) => setDiscountRupees(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-emerald-700 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-600">
              Net Shared Adjustments:{' '}
              <strong className="text-slate-900">{formatINR(sharedChargesPaise)}</strong>
            </span>
            <span className="text-slate-600">
              Total Quick-Commerce Checkout:{' '}
              <strong className="text-emerald-700 text-sm font-black">
                {formatINR(finalTotalPayablePaise)}
              </strong>
            </span>
          </div>

          {adjustments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {adjustments.map((a) => (
                <span
                  key={a.id}
                  className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-medium"
                >
                  {a.description}: {formatINR(a.amountPaise)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Participant Share Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Deterministic Fair Share Allocations
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Proportional Split &bull; Exact Integer Paise Precision
            </span>
          </div>

          <div className="border border-slate-200/90 rounded-2xl overflow-hidden text-xs shadow-2xs">
            <div className="bg-slate-100/90 px-4 py-2.5 font-bold text-slate-700 grid grid-cols-12 gap-2">
              <span className="col-span-4 sm:col-span-3">Participant</span>
              <span className="col-span-3 sm:col-span-2 text-right">Items</span>
              <span className="col-span-2 text-right hidden sm:block">Fee Share</span>
              <span className="col-span-3 sm:col-span-2 text-right">Payable</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-1 text-right hidden sm:block">Action</span>
            </div>

            <div className="divide-y divide-slate-100">
              {allocations.map((alloc) => {
                const pInfo = participantSubtotals.find((p) => p.userId === alloc.userId);
                const isCurrent = alloc.userId === user?.userId;
                const isOrg = alloc.userId === order.organizerId;
                const pStatus = pInfo?.paymentStatus || 'PENDING';

                return (
                  <div
                    key={alloc.userId}
                    className={`px-4 py-3 grid grid-cols-12 gap-2 items-center transition ${
                      isCurrent ? 'bg-emerald-50/40 font-semibold' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="col-span-4 sm:col-span-3">
                      <div className="font-bold text-slate-900 truncate">
                        {pInfo?.displayName || 'Participant'}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {isOrg && (
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                            Organizer
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right text-slate-600 font-medium">
                      {formatINR(alloc.itemSubtotalPaise)}
                    </div>

                    <div className="col-span-2 text-right text-slate-500 hidden sm:block">
                      +{formatINR(alloc.allocatedFeePaise)}
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right font-black text-slate-900">
                      {formatINR(alloc.totalPayablePaise)}
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          pStatus === 'PAID_REPORTED'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : pStatus === 'WAIVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : pStatus === 'DISPUTED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {pStatus === 'PAID_REPORTED'
                          ? 'Reported'
                          : pStatus === 'WAIVED'
                          ? 'Settled'
                          : pStatus}
                      </span>
                    </div>

                    <div className="col-span-1 text-right hidden sm:flex justify-end gap-1">
                      {isOrganizer && !isOrg && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdatePaymentStatus(alloc.userId, 'WAIVED')}
                            title="Confirm / Settle Payment"
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleUpdatePaymentStatus(alloc.userId, 'DISPUTED')}
                            title="Dispute Payment"
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Footer Row */}
            <div className="bg-slate-100/90 px-4 py-3 font-bold text-slate-900 grid grid-cols-12 gap-2 border-t border-slate-200">
              <span className="col-span-4 sm:col-span-3">Sum Total</span>
              <span className="col-span-3 sm:col-span-2 text-right">
                {formatINR(itemsTotalPaise)}
              </span>
              <span className="col-span-2 text-right hidden sm:block">
                +{formatINR(sharedChargesPaise)}
              </span>
              <span className="col-span-3 sm:col-span-2 text-right text-emerald-700 font-black">
                {formatINR(finalTotalPayablePaise)}
              </span>
              <span className="col-span-2 sm:col-span-3 text-right text-[10px] text-slate-400 font-normal">
                100% Deterministic
              </span>
            </div>
          </div>
        </div>

        {/* Participant UPI Payment Action Card */}
        {currentUserAlloc && (
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-5 rounded-2xl border border-emerald-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  Your Payment Share: {formatINR(currentUserAlloc.totalPayablePaise)}
                </h3>
              </div>

              <span className="text-[11px] font-bold text-emerald-800">
                Status:{' '}
                {currentUserPart?.paymentStatus === 'PAID_REPORTED'
                  ? 'Payment Reported'
                  : currentUserPart?.paymentStatus || 'Pending'}
              </span>
            </div>

            <p className="text-xs text-emerald-900/80">
              Pay the organizer directly via your preferred UPI app (GPay, PhonePe, Paytm, BHIM)
              and record your payment acknowledgement below.
            </p>

            <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Organizer UPI ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">{organizerUpiId}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied UPI ID</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copy UPI ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Report Paid Action */}
            {currentUserPart?.paymentStatus !== 'WAIVED' && (
              <div className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Optional: UPI Ref / UTR / Last 4 digits"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 text-xs bg-white placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleReportPayment}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {currentUserPart?.paymentStatus === 'PAID_REPORTED'
                        ? 'Update Payment Note'
                        : 'I Have Paid via UPI'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment History / Activity */}
        {payments.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Payment Acknowledgements ({payments.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden text-xs">
              {payments.map((p) => (
                <div key={p.id} className="p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800">{p.userName}</span>
                    <p className="text-[11px] text-slate-400">
                      Reported {formatINR(p.amountPaise)} &bull; {p.paymentMethod}
                      {p.reference && <span> &bull; Ref: {p.reference}</span>}
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer Notice */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Important External Settlement Notice</span>
          </div>
          <p className="text-[11px] text-emerald-900/80 leading-relaxed">
            HostelCart does not process, hold, or escrow user funds. All settlements occur directly
            between students outside the application. The actual quick-commerce app checkout total
            is authoritative.
          </p>
        </div>
      </div>
    </div>
  );
};
