import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Info, Sparkles } from 'lucide-react';
import { PLATFORMS, EXPIRY_PRESETS } from '@/utils/constants';
import { PlatformId } from '@/types/order';
import { validateThresholdRupees } from '@/utils/validators';

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();

  const [platform, setPlatform] = useState<PlatformId>('blinkit');
  const [title, setTitle] = useState('');
  const [thresholdRupees, setThresholdRupees] = useState(
    PLATFORMS.blinkit.defaultThresholdRupees.toString()
  );
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePlatformChange = (p: PlatformId) => {
    setPlatform(p);
    // Auto update threshold suggestion based on selected platform
    setThresholdRupees(PLATFORMS[p].defaultThresholdRupees.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title for this group order (e.g. "Evening Snacks")');
      return;
    }

    const thresholdVal = parseFloat(thresholdRupees);
    const thresholdCheck = validateThresholdRupees(thresholdVal);
    if (!thresholdCheck.isValid) {
      setError(thresholdCheck.error || 'Invalid threshold');
      return;
    }

    // In Phase 1 / Local demo: redirect to simulated order page
    // In Phase 3: Connected to Firestore orderService.createOrder
    navigate('/dashboard');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Group Session</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create a Group Order</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pick a platform, set a minimum subtotal target, and invite hostel-mates to pool items.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Platform selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Platform
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
                    className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-bold text-sm text-slate-900">{p.name}</span>
                    <span className="text-[11px] text-slate-500">~₹{p.defaultThresholdRupees} target</span>
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
              placeholder="e.g. Sunday Milk, Bread & Maggi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              required
            />
          </div>

          {/* Minimum Target */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Minimum Cart Target (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium text-sm">₹</span>
              <input
                type="number"
                min="10"
                step="1"
                value={thresholdRupees}
                onChange={(e) => setThresholdRupees(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Enter the target subtotal required on {PLATFORMS[platform].name} for free delivery or your coupon.
            </p>
          </div>

          {/* Expiry / Deadline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              4. Cart Freeze Deadline
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {EXPIRY_PRESETS.map((preset) => (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => setExpiryMinutes(preset.minutes)}
                  className={`py-2 px-1 text-xs rounded-lg border font-medium transition text-center ${
                    expiryMinutes === preset.minutes
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {preset.minutes}m
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Cart will automatically freeze in {expiryMinutes} minutes if not locked sooner.
            </p>
          </div>

          {/* Description & Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              5. Pickup Note or Details (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Come to Room 304 to pick up your items once delivered!"
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              As the organizer, you will place the final order in the {PLATFORMS[platform].name} app and collect participant shares.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Create & Get Shareable Invite Link</span>
          </button>
        </form>
      </div>
    </div>
  );
};
