import React from 'react';
import { Shield, Building, LogOut, CheckCircle2 } from 'lucide-react';
import { PILOT_HOSTEL } from '@/utils/constants';

interface ProfilePageProps {
  user?: {
    displayName: string;
    email: string | null;
    role: string;
    hostelId?: string | null;
  } | null;
  onSignOut?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onSignOut }) => {
  const currentName = user?.displayName || 'Ajay Kumar (Demo User)';
  const currentEmail = user?.email || 'ajay.student@campus.edu';
  const currentRole = user?.role || 'student';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Your account details and hostel membership.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl">
            {currentName.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">{currentName}</h2>
            <p className="text-xs text-slate-500">{currentEmail}</p>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Pilot Member</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Hostel</span>
            </span>
            <span className="font-semibold text-slate-800">{PILOT_HOSTEL.name}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>University</span>
            </span>
            <span className="font-semibold text-slate-800">{PILOT_HOSTEL.university}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Role</span>
            </span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 uppercase font-semibold text-[10px]">
              {currentRole}
            </span>
          </div>
        </div>

        {onSignOut && (
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onSignOut}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
