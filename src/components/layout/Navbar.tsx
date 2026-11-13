import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, LogIn, LogOut } from 'lucide-react';
import { PILOT_HOSTEL } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated, isHostelMember } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand with Official HostelCart Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="HostelCart"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
              Hostel<span className="text-emerald-600">Cart</span>
            </span>
            <div className="hidden sm:block text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              {isHostelMember ? PILOT_HOSTEL.name : 'Shop Together • Save Together'}
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            to="/dashboard"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
              isActive('/dashboard')
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/join"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
              isActive('/join')
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Join with Code
          </Link>
          <Link
            to="/history"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
              isActive('/history')
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            My Orders
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Create</span>
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-medium transition shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate hidden sm:inline font-semibold">
                  {user.displayName.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100/80 text-xs sm:text-sm font-semibold transition"
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
