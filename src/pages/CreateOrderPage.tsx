import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Info, Sparkles, Loader2, Clock, Users, ShieldAlert } from 'lucide-react';
import { PLATFORMS, EXPIRY_PRESETS } from '@/utils/constants';
import { PlatformId } from '@/types/order';
import { validateThresholdRupees } from '@/utils/validators';
import { createGroupOrder } from '@/services/orderService';
import { useAuth } from '@/hooks/useAuth';

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [platform, setPlatform] = useState<PlatformId>('blinkit');
  const [title, setTitle] = useState('');
  const [thresholdRupees, setThresholdRupees] = useState(
    PLATFORMS.blinkit.defaultThresholdRupees.toString()
  );
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [participantLimit, setParticipantLimit] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlatformChange = (p: PlatformId) => {
    setPlatform(p);
    setThresholdRupees(PLATFORMS[p].defaultThresholdRupees.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !user.hostelId) {
      setError('You must be registered in a hostel to create an order.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title for this group cart (e.g. "Evening Snacks").');
      return;
    }

    const thresholdVal = parseFloat(thresholdRupees);
    const thresholdCheck = validateThresholdRupees(thresholdVal);
    if (!thresholdCheck.isValid) {
      setError(thresholdCheck.error || 'Invalid threshold amount.');
      return;
    }

    setLoading(true);
    try {
      const createdOrder = await createGroupOrder({
        title: title.trim(),
        platform,
        organizerId: user.userId,
        organizerName: user.displayName + (user.roomNumber ? ` (Room ${user.roomNumber})` : ''),
        hostelId: user.hostelId,
        minimumAmountRupees: thresholdVal,
        durationMinutes: expiryMinutes,
        description: description.trim(),
        pickupNote: pickupNote.trim(),
        participantLimit: participantLimit ? parseInt(participantLimit, 10) : null,
      });

      // Navigate to the newly created order details page
      navigate(`/orders/${createdOrder.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>New Quick-Commerce Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Create a Group Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pick a delivery platform, set the minimum threshold, and invite hostel-mates to pool their items.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform selector cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Choose Platform
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(PLATFORMS) as PlatformId[]).map((pKey) => {
                const p = PLATFORMS[pKey];
                const isSelected = platform === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => handlePlatformChange(pKey)}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-100 flex items-center justify-center overflow-hidden shadow-2xs">
                      <img
                        src={p.logoUrl}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ~₹{p.defaultThresholdRupees} target
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Order Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunday Milk, Bread & Chips"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              required
            />
          </div>

          {/* Minimum Target */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Minimum Cart Target (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                min="10"
                step="1"
                value={thresholdRupees}
                onChange={(e) => setThresholdRupees(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-900"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              The item subtotal target required on {PLATFORMS[platform].name} for free delivery or coupon eligibility.
            </p>
          </div>

          {/* Cart Deadline / Expiry */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>4. Cart Freeze Deadline</span>
              <span className="text-[11px] text-emerald-700 font-semibold lowercase">
                freezes in {expiryMinutes} mins
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {EXPIRY_PRESETS.map((preset) => (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => setExpiryMinutes(preset.minutes)}
                  className={`py-2.5 px-2 text-xs rounded-xl border font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                    expiryMinutes === preset.minutes
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 opacity-80" />
                  <span>{preset.minutes}m</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pickup & Room Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              5. Pickup Location / Room Note (Optional)
            </label>
            <input
              type="text"
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
              placeholder="e.g. Come to Room 304 to pick up your items"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          {/* Participant Limit & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Max Participants (Optional)
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={participantLimit}
                  onChange={(e) => setParticipantLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Extra Note (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Ordering urgently for assignment night"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Organizer Disclaimer Callout */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              As the organizer, you will place the final order in the {PLATFORMS[platform].name} app and collect participant shares. HostelCart does not place orders or collect payments directly.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Session...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Create & Generate Invite Code</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
