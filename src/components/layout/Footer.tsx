import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/90 bg-white py-10 px-4 sm:px-6 text-slate-500 text-xs pb-28 md:pb-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
          {/* Brand & Attribution */}
          <div className="space-y-3 max-w-sm flex flex-col items-center md:items-start">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-slate-200/90 shadow-2xs flex items-center justify-center overflow-hidden group-hover:border-emerald-400 transition">
                <img
                  src="/logo.png"
                  alt="HostelCart Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                  Hostel<span className="text-emerald-600">Cart</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 leading-none">
                  Pilot
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed">
              Hostel quick-commerce group coordination. Shop together, eliminate small cart delivery fees, and split checkout amounts fairly.
            </p>

            {/* Designed and Developed By Ajay Kushwaha */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-700 font-medium text-xs shadow-2xs">
                <span>Designed & Developed with</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block animate-pulse" />
                <span>by</span>
                <strong className="text-slate-900 font-bold hover:text-emerald-600 transition">
                  Ajay Kushwaha
                </strong>
                <Sparkles className="w-3 h-3 text-amber-500 inline-block" />
              </div>
            </div>
          </div>

          {/* Quick Links & Platform Scope */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12">
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-emerald-600 transition font-medium"
                  >
                    Active Group Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/join"
                    className="hover:text-emerald-600 transition font-medium"
                  >
                    Join with Invite Code
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create"
                    className="hover:text-emerald-600 transition font-medium"
                  >
                    Start New Group Cart
                  </Link>
                </li>
                <li>
                  <Link
                    to="/history"
                    className="hover:text-emerald-600 transition font-medium"
                  >
                    Order History & Receipts
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Supported Platforms
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-center md:justify-start gap-1.5 font-medium text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Blinkit</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-1.5 font-medium text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>Zepto</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-1.5 font-medium text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span>Swiggy Instamart</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Regulatory & Functional Disclaimer Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-700">
              Independent Coordination Platform Notice
            </p>
            <p>
              HostelCart is an independent coordination tool for student communities. We do not process banking transactions, charge commissions, or hold user funds in escrow. All actual store checkouts and deliveries are completed through the respective official applications (Blinkit, Zepto, Swiggy Instamart).
            </p>
          </div>
        </div>

        {/* Copyright Bottom Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} HostelCart. All rights reserved.</p>
          <p className="font-medium text-slate-500">
            Engineered with React 18, TypeScript, Tailwind CSS & Firebase
          </p>
        </div>
      </div>
    </footer>
  );
};
