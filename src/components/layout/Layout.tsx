import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';
import { isFirebaseConfigured } from '@/services/firebase';
import { AlertCircle } from 'lucide-react';

interface LayoutProps {
  user?: { displayName: string; role: string; hostelId?: string | null } | null;
  onSignOut?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, onSignOut }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Firebase configuration banner if running with placeholder keys */}
      {!isFirebaseConfigured && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Demo / Local Mode:</strong> Firebase credentials are set to development placeholders. Configure your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> to connect your live Firebase project or start the emulator.
          </span>
        </div>
      )}

      <Navbar user={user} onSignOut={onSignOut} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};
