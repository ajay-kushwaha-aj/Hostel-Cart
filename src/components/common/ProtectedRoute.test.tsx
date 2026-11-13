import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as AuthHook from '../../hooks/useAuth';
import { UserProfile } from '../../types/user';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute Navigation Guard (Phase 2)', () => {
  const mockUseAuth = vi.mocked(AuthHook.useAuth);

  it('shows loading indicator while verifying authentication state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      firebaseUser: null,
      loading: true,
      isAuthenticated: false,
      isHostelMember: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInAsDemo: vi.fn(),
      signOut: vi.fn(),
      joinHostel: vi.fn(),
      updateProfile: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Verifying hostel session/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      firebaseUser: null,
      loading: false,
      isAuthenticated: false,
      isHostelMember: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInAsDemo: vi.fn(),
      signOut: vi.fn(),
      joinHostel: vi.fn(),
      updateProfile: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page Form</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Form')).toBeInTheDocument();
    expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument();
  });

  it('redirects authenticated users without hostelId to /onboarding', () => {
    const unverifiedUser: UserProfile = {
      userId: 'u1',
      displayName: 'New User',
      email: 'new@campus.edu',
      hostelId: null, // No hostel
      role: 'student',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    mockUseAuth.mockReturnValue({
      user: unverifiedUser,
      firebaseUser: null,
      loading: false,
      isAuthenticated: true,
      isHostelMember: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInAsDemo: vi.fn(),
      signOut: vi.fn(),
      joinHostel: vi.fn(),
      updateProfile: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireHostel={true}>
                <div>Secret Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/onboarding" element={<div>Enter Hostel Code</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Enter Hostel Code')).toBeInTheDocument();
    expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument();
  });

  it('allows access to protected feature when user is authenticated and verified hostel member', () => {
    const verifiedUser: UserProfile = {
      userId: 'u1',
      displayName: 'Verified Student',
      email: 'student@campus.edu',
      hostelId: 'HOSTEL_PILOT_01',
      role: 'student',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    mockUseAuth.mockReturnValue({
      user: verifiedUser,
      firebaseUser: null,
      loading: false,
      isAuthenticated: true,
      isHostelMember: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInAsDemo: vi.fn(),
      signOut: vi.fn(),
      joinHostel: vi.fn(),
      updateProfile: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireHostel={true}>
                <div>Welcome to Pilot Hostel Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to Pilot Hostel Dashboard')).toBeInTheDocument();
  });
});
