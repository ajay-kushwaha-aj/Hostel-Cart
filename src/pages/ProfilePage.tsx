import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building, LogOut, CheckCircle2, Save, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { PILOT_HOSTEL } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, updateProfile, signInAsDemo } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '');
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        displayName: displayName.trim(),
        roomNumber: roomNumber.trim() || null,
        upiId: upiId.trim() || null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details and hostel membership.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">{user?.displayName || 'Student'}</h2>
            <p className="text-xs text-slate-500">{user?.email || 'student@campus.edu'}</p>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{user?.hostelId ? 'Verified Hostel Member' : 'Needs Hostel Verification'}</span>
            </div>
          </div>
        </div>

        {/* Edit Safe Profile Info Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Room Number (Optional)
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 304"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                UPI ID for Receiving Payments (Optional)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okaxis or yourname@paytm"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Displayed to participants when you organize group orders.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>

            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile updated!
              </span>
            )}
          </div>
        </form>

        {/* Read-Only Hostel & Role Details */}
        <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Hostel</span>
            </span>
            <span className="font-semibold text-slate-800">
              {user?.hostelId ? PILOT_HOSTEL.name : 'Not joined yet'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>University</span>
            </span>
            <span className="font-semibold text-slate-800">{PILOT_HOSTEL.university}</span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Account Role</span>
            </span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 uppercase font-semibold text-[10px]">
              {user?.role || 'student'}
            </span>
          </div>
        </div>

        {/* Testing Switch User Utility */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Switch Test Persona (Dev Testing)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => signInAsDemo('student', 'Ajay (Organizer)')}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-left flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Switch to Organizer</span>
            </button>
            <button
              type="button"
              onClick={() => signInAsDemo('student', 'Sneha (Student C)')}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-left flex items-center gap-2"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Switch to Student C</span>
            </button>
          </div>
        </div>

        {/* Sign Out Action */}
        <div className="pt-2">
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
