import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { PILOT_HOSTEL } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';

export const HostelOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, joinHostel, isHostelMember } = useAuth();

  const [code, setCode] = useState(PILOT_HOSTEL.defaultInviteCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // If user is already in a hostel, redirect to dashboard
  if (isHostelMember) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await joinHostel(code);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Failed to join hostel. Invalid code.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error validating hostel code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
          <Building className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Hostel Verification</h1>
        <p className="text-xs text-slate-500">
          Welcome, <strong className="text-slate-800">{user?.displayName || 'Student'}</strong>! Enter your hostel invite code to view and share group orders in your building.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Hostel Invite Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. HOSTEL2026"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-mono font-bold tracking-widest text-lg uppercase"
              required
            />
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Active pilot code: <code className="font-semibold text-emerald-700">{PILOT_HOSTEL.defaultInviteCode}</code>
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying with Hostel...</span>
              </>
            ) : (
              <>
                <span>Verify & Enter Hostel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
