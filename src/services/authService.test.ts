import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerWithEmail,
  loginWithEmail,
  loginDemoUser,
  logoutUser,
  getUserProfile,
  updateSafeProfile,
  createMockUserProfile,
} from './authService';
import { PILOT_HOSTEL } from '../utils/constants';

describe('Auth Service (Phase 2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates mock user profile with expected fields', () => {
    const profile = createMockUserProfile('u100', 'Test Student', 'test@campus.edu');
    expect(profile.userId).toBe('u100');
    expect(profile.displayName).toBe('Test Student');
    expect(profile.email).toBe('test@campus.edu');
    expect(profile.role).toBe('student');
    expect(profile.hostelId).toBe(PILOT_HOSTEL.id);
    expect(profile.isActive).toBe(true);
  });

  it('registers a new user and joins pilot hostel if valid code is passed', async () => {
    const user = await registerWithEmail(
      'newstudent@campus.edu',
      'password123',
      'New Student',
      PILOT_HOSTEL.defaultInviteCode
    );

    expect(user.displayName).toBe('New Student');
    expect(user.email).toBe('newstudent@campus.edu');
    expect(user.hostelId).toBe(PILOT_HOSTEL.id);

    // Profile should be retrievable
    const fetched = await getUserProfile(user.userId);
    expect(fetched?.userId).toBe(user.userId);
    expect(fetched?.displayName).toBe('New Student');
  });

  it('registers user without hostel if code is omitted or invalid', async () => {
    const user = await registerWithEmail(
      'nohostel@campus.edu',
      'password123',
      'No Hostel Student',
      'INVALID_CODE'
    );

    expect(user.hostelId).toBeNull();
  });

  it('logs in demo user with specific persona', async () => {
    const demo = await loginDemoUser('student', 'Ajay Organizer');
    expect(demo.displayName).toBe('Ajay Organizer');
    expect(demo.role).toBe('student');
    expect(demo.hostelId).toBe(PILOT_HOSTEL.id);
  });

  it('updates safe profile fields (displayName and roomNumber)', async () => {
    const user = await registerWithEmail('update@campus.edu', 'pass123', 'Before Update');
    await updateSafeProfile(user.userId, { displayName: 'After Update', roomNumber: '402' });

    const updated = await getUserProfile(user.userId);
    expect(updated?.displayName).toBe('After Update');
    expect(updated?.roomNumber).toBe('402');
  });

  it('logs in an existing user with email and password', async () => {
    await registerWithEmail('loginuser@campus.edu', 'secret123', 'Login Student');
    const loggedIn = await loginWithEmail('loginuser@campus.edu', 'secret123');
    expect(loggedIn.email).toBe('loginuser@campus.edu');
    expect(loggedIn.displayName).toBe('Login Student');
  });

  it('logs out user and removes session', async () => {
    const user = await registerWithEmail('logout@campus.edu', 'pass123', 'To Logout');
    expect(await getUserProfile(user.userId)).not.toBeNull();

    await logoutUser();
    expect(await getUserProfile(user.userId)).toBeNull();
  });
});
