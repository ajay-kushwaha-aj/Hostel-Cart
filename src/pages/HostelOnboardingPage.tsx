import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ArrowRight } from 'lucide-react';
import { PILOT_HOSTEL } from '@/utils/constants';

export const HostelOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === PILOT_HOSTEL.defaultInviteCode) {
      navigate('/dashboard');
    } else {
      setError(`Invalid code for pilot. Use "${PILOT_HOSTEL.defaultInviteCode}" or ask your hostel rep.`);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
          <Building className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Join Your Hostel</h1>
        <p className="text-xs text-slate-500">
          Enter your hostel verification code to view orders in your building.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Hostel Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. HOSTEL2026"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-mono font-bold tracking-widest text-lg uppercase"
              required
            />
            <p className="text-[11px] text-slate-500 text-center">
              Active pilot hostel: <code className="font-semibold text-emerald-700">{PILOT_HOSTEL.defaultInviteCode}</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Verify & Enter Hostel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
