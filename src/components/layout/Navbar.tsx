import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, PlusCircle, LogIn, User as UserIcon } from 'lucide-react';
import { PILOT_HOSTEL } from '@/utils/constants';

interface NavbarProps {
  user?: { displayName: string; role: string; hostelId?: string | null } | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
              Hostel<span className="text-emerald-600">Cart</span>
            </span>
            <div className="hidden sm:block text-[11px] text-slate-500 font-medium leading-none">
              {PILOT_HOSTEL.name}
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/dashboard')
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/join"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/join')
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Join with Code
          </Link>
          <Link
            to="/history"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/history')
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            My Orders
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-sm transition active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Create</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {user.displayName || 'Profile'}
                </span>
              </Link>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-xs text-slate-500 hover:text-red-600 px-2 py-1"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
