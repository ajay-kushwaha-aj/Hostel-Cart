import React from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowRight } from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Order History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Past group orders you organized or joined in your hostel.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <History className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="font-semibold text-slate-700">No past completed sessions yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Completed or archived group orders will show up here with final summaries and payment receipts.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
        >
          <span>Go to Active Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
