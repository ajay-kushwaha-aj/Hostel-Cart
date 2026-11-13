import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Users, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { PLATFORMS, PILOT_HOSTEL } from '@/utils/constants';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Banner */}
      <section className="text-center max-w-2xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Pilot for {PILOT_HOSTEL.name}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Shop Together. <br className="hidden sm:inline" />
          <span className="text-emerald-600">Save Together.</span> <br />
          No Unnecessary Items.
        </h1>

        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Need ₹80 worth of groceries but the minimum cart value is ₹199? Combine your order with hostel-mates, hit the threshold together, and split fairly without buying junk you don't need.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Create a Group Cart</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/join"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 shadow-sm transition active:scale-95"
          >
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Join with Code</span>
          </Link>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Supported Quick-Commerce Platforms
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.values(PLATFORMS).map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition text-center space-y-2"
            >
              <div
                className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center font-bold text-lg text-white"
                style={{ backgroundColor: p.themeColor }}
              >
                {p.name.charAt(0)}
              </div>
              <h3 className="font-bold text-slate-900">{p.name}</h3>
              <p className="text-xs text-slate-500">
                Typical minimum target: ~₹{p.defaultThresholdRupees}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">
          How HostelCart Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900">Start or Join an Order</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pick Blinkit, Zepto, or Instamart, set the minimum order target and deadline, and share the invite code on your hostel WhatsApp group.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900">Add Genuine Needs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Each student adds only what they genuinely need—paste product URLs or enter items manually. Track the live group total in real time.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900">Coordinate & Settle</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once the threshold is reached, lock the cart. Pay the organizer via UPI outside the app, and the organizer places the combined order.
            </p>
          </div>
        </div>
      </section>

      {/* Key Guarantees & Transparency Notice */}
      <section className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <ShieldAlert className="w-4 h-4 text-emerald-700" />
          <span>Important Transparency Note</span>
        </div>
        <ul className="space-y-1.5 list-disc list-inside text-slate-600">
          <li>HostelCart does not place orders or collect payments directly.</li>
          <li>Threshold reached does not guarantee free delivery; platform checkout is authoritative.</li>
          <li>Delivery or handling charges are split fairly and transparently.</li>
        </ul>
      </section>
    </div>
  );
};
