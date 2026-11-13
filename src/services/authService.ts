import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { UserProfile } from '../types/user';
import { PILOT_HOSTEL } from '../utils/constants';

const LOCAL_STORAGE_USER_KEY = 'hostelcart_mock_user';

// Helper to create a fallback / demo user
export function createMockUserProfile(
  userId: string,
  displayName: string,
  email: string,
  hostelId: string | null = PILOT_HOSTEL.id,
  role: 'student' | 'admin' = 'student'
): UserProfile {
  return {
    userId,
    displayName,
    email,
    hostelId,
    role,
    roomNumber: '304',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
  };
}

/**
 * Sign up a new user with email, password, and display name.
 * Creates the auth account and persists the user profile in Firestore.
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  hostelCode?: string
): Promise<UserProfile> {
  const trimmedEmail = email.trim();
  const trimmedName = displayName.trim();

  if (!isFirebaseConfigured) {
    // Local / Offline demo mode
    const mockId = 'user_' + Math.random().toString(36).substring(2, 9);
    const hasHostel = hostelCode?.trim().toUpperCase() === PILOT_HOSTEL.defaultInviteCode;
    const profile = createMockUserProfile(
      mockId,
      trimmedName || 'Student',
      trimmedEmail,
      hasHostel ? PILOT_HOSTEL.id : null
    );
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    return profile;
  }

  // Real Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
  const fbUser = userCredential.user;

  await updateFirebaseProfile(fbUser, { displayName: trimmedName });

  const hasHostel = hostelCode?.trim().toUpperCase() === PILOT_HOSTEL.defaultInviteCode;
  const initialHostelId = hasHostel ? PILOT_HOSTEL.id : null;

  const userProfile: UserProfile = {
    userId: fbUser.uid,
    displayName: trimmedName,
    email: fbUser.email,
    hostelId: initialHostelId,
    role: 'student',
    photoURL: fbUser.photoURL || null,
    roomNumber: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
  };

  // Write to users collection
  const userRef = doc(db, 'users', fbUser.uid);
  await setDoc(userRef, {
    ...userProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userProfile;
}

/**
 * Sign in an existing user with email and password.
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const trimmedEmail = email.trim();

  if (!isFirebaseConfigured) {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch {
        // Fall through to create fresh mock
      }
    }
    const mockProfile = createMockUserProfile('demo_u1', 'Ajay Kumar', trimmedEmail);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockProfile));
    return mockProfile;
  }

  const credential = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
  const profile = await getUserProfile(credential.user.uid);
  if (!profile) {
    throw new Error('User profile record not found in Firestore.');
  }
  return profile;
}

/**
 * Sign in instantly with a preset demo profile (great for evaluation & local testing).
 */
export async function loginDemoUser(
  role: 'student' | 'admin' = 'student',
  name: string = 'Ajay (Demo Student)',
  hostelId: string | null = PILOT_HOSTEL.id
): Promise<UserProfile> {
  const demoProfile = createMockUserProfile(
    'demo_' + Math.random().toString(36).substring(2, 7),
    name,
    'student@campus.edu',
    hostelId,
    role
  );
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoProfile));
  return demoProfile;
}

/**
 * Sign out current user.
 */
export async function logoutUser(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}

/**
 * Fetches user profile from Firestore users/{userId}.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.userId === userId) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    return null;
  }
  const data = snap.data();
  return {
    userId,
    displayName: data.displayName || 'Student',
    email: data.email || null,
    hostelId: data.hostelId || null,
    role: data.role || 'student',
    photoURL: data.photoURL || null,
    roomNumber: data.roomNumber || null,
    createdAt: data.createdAt?.toMillis?.() || Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
    isActive: data.isActive ?? true,
  };
}

/**
 * Updates safe profile fields for a user.
 */
export async function updateSafeProfile(
  userId: string,
  updates: { displayName?: string; roomNumber?: string | null; photoURL?: string | null }
): Promise<void> {
  if (!isFirebaseConfigured) {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const updated = { ...parsed, ...updates, updatedAt: Date.now() };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    }
    return;
  }

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribes to authentication state changes.
 */
export function onAuthChange(
  callback: (userProfile: UserProfile | null, fbUser: FirebaseUser | null) => void
): () => void {
  if (!isFirebaseConfigured) {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        callback(JSON.parse(saved), null);
      } catch {
        callback(null, null);
      }
    } else {
      callback(null, null);
    }
    // Return dummy unsubscribe
    return () => {};
  }

  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null, null);
      return;
    }

    try {
      const profile = await getUserProfile(fbUser.uid);
      callback(profile, fbUser);
    } catch (err) {
      console.error('Error fetching user profile on auth change:', err);
      callback(null, fbUser);
    }
  });
}
