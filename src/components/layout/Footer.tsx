import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 text-slate-500 text-xs pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">HostelCart</span>
          <span>&copy; {new Date().getFullYear()} — Student Group Order Coordination</span>
        </div>

        <div className="flex items-center gap-2 max-w-lg text-center md:text-right text-[11px] leading-relaxed text-slate-500">
          <Info className="w-4 h-4 flex-shrink-0 text-slate-400" />
          <span>
            HostelCart is an independent coordination tool. We do not place orders, take commissions, or collect money. Third-party app checkout (Blinkit, Zepto, Swiggy Instamart) remains authoritative.
          </span>
        </div>
      </div>
    </footer>
  );
};
