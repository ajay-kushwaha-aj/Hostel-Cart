import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { PILOT_HOSTEL } from '../utils/constants';
import { Hostel } from '../types/user';

export interface JoinHostelResult {
  success: boolean;
  message?: string;
  hostel?: Hostel;
}

/**
 * Validates hostel invite code and associates user with the hostel.
 */
export async function validateAndJoinHostel(
  userId: string,
  inviteCode: string
): Promise<JoinHostelResult> {
  if (!inviteCode || typeof inviteCode !== 'string') {
    return { success: false, message: 'Please enter a valid invite code.' };
  }

  const cleanCode = inviteCode.trim().toUpperCase();

  // Validate against Pilot Hostel invite code
  if (cleanCode !== PILOT_HOSTEL.defaultInviteCode) {
    return {
      success: false,
      message: `Invalid invite code. For the pilot hostel, please use "${PILOT_HOSTEL.defaultInviteCode}".`,
    };
  }

  const hostelData: Hostel = {
    id: PILOT_HOSTEL.id,
    name: PILOT_HOSTEL.name,
    university: PILOT_HOSTEL.university,
    isActive: true,
    createdAt: Date.now(),
  };

  if (!isFirebaseConfigured) {
    // Offline / Demo mode
    const stored = localStorage.getItem('hostelcart_mock_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.hostelId = PILOT_HOSTEL.id;
        parsed.updatedAt = Date.now();
        localStorage.setItem('hostelcart_mock_user', JSON.stringify(parsed));
      } catch {
        // Ignore
      }
    }
    return {
      success: true,
      message: `Welcome to ${PILOT_HOSTEL.name}!`,
      hostel: hostelData,
    };
  }

  // Real Firebase mode: Update user document in Firestore
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      hostelId: PILOT_HOSTEL.id,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Welcome to ${PILOT_HOSTEL.name}!`,
      hostel: hostelData,
    };
  } catch (err: unknown) {
    console.error('Failed to link user with hostel in Firestore:', err);
    return {
      success: false,
      message: 'Failed to join hostel. Please verify your permissions and try again.',
    };
  }
}

/**
 * Fetches hostel details by ID.
 */
export async function getHostelDetails(hostelId: string): Promise<Hostel | null> {
  if (hostelId === PILOT_HOSTEL.id) {
    return {
      id: PILOT_HOSTEL.id,
      name: PILOT_HOSTEL.name,
      university: PILOT_HOSTEL.university,
      isActive: true,
      createdAt: Date.now(),
    };
  }

  if (!isFirebaseConfigured) {
    return null;
  }

  try {
    const hostelRef = doc(db, 'hostels', hostelId);
    const snap = await getDoc(hostelRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      id: hostelId,
      name: data.name,
      university: data.university,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toMillis?.() || Date.now(),
    };
  } catch {
    return null;
  }
}
