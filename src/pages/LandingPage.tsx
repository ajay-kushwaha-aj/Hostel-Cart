import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';
import { PLATFORMS, PILOT_HOSTEL } from '@/utils/constants';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-6">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10 md:gap-12">
          {/* Left Text & CTA */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs animate-pulse-slow">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilot Live at {PILOT_HOSTEL.name}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Shop Together. <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Save Together.
              </span> <br />
              No Unwanted Items.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
              Need ₹75 worth of snacks or milk but the quick-commerce minimum cart value is ₹199? Pool genuine items with your hostel-mates, hit the threshold together, and split transparently.
            </p>

            {/* CTAs with Glow and Hover Animations */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 pt-2">
              <Link
                to="/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Start a Group Cart</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                to="/join"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300/80 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Join with Code</span>
              </Link>
            </div>

            {/* Micro badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium hover:text-emerald-700 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free to coordinate
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium hover:text-emerald-700 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Integer paise math
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium hover:text-emerald-700 transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Direct UPI between students
              </span>
            </div>
          </div>

          {/* Right Hero Interactive Animated Illustration Composition */}
          <div className="flex-1 flex justify-center relative select-none">
            <div className="relative group max-w-sm w-full flex items-center justify-center">
              {/* Animated Ambient Backing Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-teal-400/20 to-sky-500/30 rounded-full blur-2xl opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 pointer-events-none animate-pulse-slow" />

              {/* Main Community Logo Illustration */}
              <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500">
                <img
                  src="/logo.png"
                  alt="HostelCart Community Shopping"
                  className="w-full h-full object-contain filter drop-shadow-xl"
                />
              </div>

              {/* Floating Live Badge 1: Ajay added Milk */}
              <div className="absolute -top-3 -left-3 sm:-top-5 sm:-left-6 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-2.5 animate-float hover:shadow-xl transition-all">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-slate-900 leading-none">Ajay added 1L Milk</p>
                  <p className="text-[9px] font-semibold text-emerald-700 mt-0.5 leading-none">₹54.00</p>
                </div>
              </div>

              {/* Floating Live Badge 2: Rohan added Bread */}
              <div className="absolute -top-2 -right-3 sm:-top-4 sm:-right-6 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-2.5 animate-float-delayed hover:shadow-xl transition-all">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                </span>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-slate-900 leading-none">Rohan added Bread</p>
                  <p className="text-[9px] font-semibold text-teal-700 mt-0.5 leading-none">₹45.00</p>
                </div>
              </div>

              {/* Floating Live Badge 3: Threshold Reached */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-float hover:scale-105 transition-all whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-bold tracking-tight">₹199 Target Met • 0 Delivery Fee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Life Problem & Solution Comparison with Hover Elevate */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Why Hostel Students Love HostelCart
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            The ₹199 Minimum Cart Dilemma, Solved.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Old way */}
          <div className="bg-rose-50/60 rounded-3xl p-6 border border-rose-200/80 space-y-3 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wide bg-rose-100 px-3 py-1 rounded-full">
              <span>Without HostelCart</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900">Forced Unnecessary Purchases</h3>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">&times;</span>
                <span>You only need bread & milk (₹85) late at night.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">&times;</span>
                <span>Add ₹114 worth of unwanted chips, soda, or chocolates just to reach ₹199.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">&times;</span>
                <span>Or pay a heavy ₹35-₹49 small-cart delivery fee alone.</span>
              </li>
            </ul>
          </div>

          {/* HostelCart way */}
          <div className="bg-emerald-50/60 rounded-3xl p-6 border border-emerald-200/80 space-y-3 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide bg-emerald-100 px-3 py-1 rounded-full">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>With HostelCart</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900">Pool Exact Needs & Split Fairly</h3>
            <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">&check;</span>
                <span>Student A adds milk (₹85), Student B adds eggs (₹65), Student C adds maggi (₹75).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">&check;</span>
                <span>Combined cart hits ₹225—unlocking the platform minimum instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">&check;</span>
                <span>Nobody spends a single extra rupee on junk food they don't want.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Supported Platforms with Dynamic 3D Scale on Hover */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Works with Top Quick-Commerce Apps
          </h2>
          <p className="text-xs text-slate-500">
            Create a cart for your favourite delivery app in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.values(PLATFORMS).map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Platform Official Logo Card */}
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white p-2 border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
                  <img
                    src={p.logoUrl}
                    alt={`${p.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-700 transition">
                    {p.name}
                  </h3>
                  <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                    Typical target: ₹{p.defaultThresholdRupees}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Combine groceries, snacks & drinks to reach minimum order value with hostel-mates.
                </p>
              </div>

              <Link
                to="/create"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 border border-slate-200/80 transition-all duration-200 shadow-2xs active:scale-95"
              >
                Start {p.name} Cart
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Step-by-Step with Bespoke SVG Vector Illustrations */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Simple 3-Step Coordination
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How HostelCart Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            {/* Step 1 Vector Illustration */}
            <div className="h-28 rounded-xl bg-white border border-slate-200/70 p-3 flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-emerald-300 transition-colors">
              <svg viewBox="0 0 200 110" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="15" width="170" height="80" rx="12" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x="30" y="30" width="140" height="22" rx="6" fill="#FFFFFF" stroke="#BBF7D0" strokeWidth="1.5" />
                <circle cx="44" cy="41" r="5" fill="#10B981" />
                <rect x="56" y="37" width="55" height="8" rx="2" fill="#CBD5E1" />
                <rect x="135" y="37" width="24" height="8" rx="2" fill="#10B981" />
                {/* Progress bar */}
                <rect x="30" y="65" width="140" height="10" rx="5" fill="#E2E8F0" />
                <rect x="30" y="65" width="105" height="10" rx="5" fill="#10B981" />
                <circle cx="135" cy="70" r="7" fill="#047857" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shadow-2xs">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Hostel-Scoped Session</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pick a platform, set your minimum threshold target and deadline, then share the unique 6-character code on your floor WhatsApp group.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            {/* Step 2 Vector Illustration */}
            <div className="h-28 rounded-xl bg-white border border-slate-200/70 p-3 flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-emerald-300 transition-colors">
              <svg viewBox="0 0 200 110" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="15" width="170" height="80" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
                {/* User 1 item card */}
                <rect x="28" y="28" width="144" height="20" rx="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
                <circle cx="39" cy="38" r="4.5" fill="#3B82F6" />
                <rect x="49" y="34" width="60" height="7" rx="2" fill="#64748B" />
                <rect x="140" y="34" width="22" height="7" rx="2" fill="#059669" />
                {/* User 2 item card */}
                <rect x="28" y="53" width="144" height="20" rx="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
                <circle cx="39" cy="63" r="4.5" fill="#8B5CF6" />
                <rect x="49" y="59" width="48" height="7" rx="2" fill="#64748B" />
                <rect x="140" y="59" width="22" height="7" rx="2" fill="#059669" />
                {/* Adding item action pill */}
                <rect x="55" y="78" width="90" height="14" rx="7" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1" />
                <circle cx="65" cy="85" r="2.5" fill="#10B981" />
                <rect x="72" y="82" width="60" height="5" rx="1.5" fill="#059669" />
              </svg>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shadow-2xs">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Real-Time Cart Assembly</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hostel-mates join and add genuine grocery links or items. Everyone sees the live progress bar fill up until the threshold is reached.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            {/* Step 3 Vector Illustration */}
            <div className="h-28 rounded-xl bg-white border border-slate-200/70 p-3 flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-emerald-300 transition-colors">
              <svg viewBox="0 0 200 110" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="15" width="170" height="80" rx="12" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
                {/* Center Lock Badge */}
                <circle cx="100" cy="38" r="11" fill="#047857" />
                <rect x="94" y="37" width="12" height="9" rx="2" fill="#FFFFFF" />
                <path d="M96 37v-2a4 4 0 018 0v2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                {/* Three Fair Share Student Cards */}
                <rect x="25" y="58" width="44" height="26" rx="5" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="1" />
                <rect x="32" y="64" width="30" height="6" rx="1.5" fill="#059669" />
                <rect x="32" y="73" width="18" height="4" rx="1" fill="#94A3B8" />

                <rect x="78" y="58" width="44" height="26" rx="5" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="1" />
                <rect x="85" y="64" width="30" height="6" rx="1.5" fill="#059669" />
                <rect x="85" y="73" width="18" height="4" rx="1" fill="#94A3B8" />

                <rect x="131" y="58" width="44" height="26" rx="5" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="1" />
                <rect x="138" y="64" width="30" height="6" rx="1.5" fill="#059669" />
                <rect x="138" y="73" width="18" height="4" rx="1" fill="#94A3B8" />
              </svg>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shadow-2xs">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Lock & Split Fairly</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The organizer freezes the cart, inputs actual platform delivery/tax charges, participants pay via UPI, and the order is placed independently.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Non-Financial Guarantee Notice */}
      <section className="bg-slate-100/70 rounded-2xl p-5 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3 hover:bg-slate-100 transition-colors">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-slate-800">Trust & Transparency Guarantee</h4>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            HostelCart does not hold, collect, or transfer student funds. Payment settlements occur directly between students via standard UPI outside the application. Final checkout eligibility and prices are determined by the respective delivery platforms.
          </p>
        </div>
      </section>
    </div>
  );
};
