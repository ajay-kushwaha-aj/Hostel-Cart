export type UserRole = 'student' | 'admin';

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string | null;
  hostelId: string | null;
  role: UserRole;
  photoURL?: string | null;
  roomNumber?: string | null;
  createdAt: number; // Unix timestamp in ms or Firestore timestamp
  updatedAt: number;
  isActive: boolean;
}

export interface Hostel {
  id: string;
  name: string;
  university: string;
  inviteCodeHash?: string;
  isActive: boolean;
  createdAt: number;
}

