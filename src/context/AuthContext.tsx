import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types/user';
import {
  registerWithEmail,
  loginWithEmail,
  loginDemoUser,
  logoutUser,
  getUserProfile,
  updateSafeProfile,
  onAuthChange,
} from '../services/authService';
import { validateAndJoinHostel } from '../services/hostelService';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isHostelMember: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, displayName: string, hostelCode?: string) => Promise<void>;
  signInAsDemo: (role?: 'student' | 'admin', name?: string, hostelId?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  joinHostel: (inviteCode: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (updates: { displayName?: string; roomNumber?: string | null }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((profile, fbUser) => {
      setUser(profile);
      setFirebaseUser(fbUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await loginWithEmail(email, pass);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    displayName: string,
    hostelCode?: string
  ) => {
    setLoading(true);
    try {
      const profile = await registerWithEmail(email, pass, displayName, hostelCode);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemo = async (
    role: 'student' | 'admin' = 'student',
    name?: string,
    hostelId?: string | null
  ) => {
    setLoading(true);
    try {
      const demoUser = await loginDemoUser(role, name, hostelId);
      setUser(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setFirebaseUser(null);
    } finally {
      setLoading(false);
    }
  };

  const joinHostel = async (inviteCode: string) => {
    if (!user) {
      return { success: false, message: 'You must be signed in to join a hostel.' };
    }

    const result = await validateAndJoinHostel(user.userId, inviteCode);
    if (result.success && result.hostel) {
      setUser((prev) => (prev ? { ...prev, hostelId: result.hostel!.id } : null));
    }
    return { success: result.success, message: result.message };
  };

  const updateProfile = async (updates: { displayName?: string; roomNumber?: string | null }) => {
    if (!user) return;
    await updateSafeProfile(user.userId, updates);
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const refreshProfile = async () => {
    if (!user) return;
    const refreshed = await getUserProfile(user.userId);
    if (refreshed) {
      setUser(refreshed);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user,
    isHostelMember: !!user?.hostelId,
    signIn,
    signUp,
    signInAsDemo,
    signOut,
    joinHostel,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

