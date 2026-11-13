import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HostelOnboardingPage } from './pages/HostelOnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { JoinOrderPage } from './pages/JoinOrderPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { PaymentSummaryPage } from './pages/PaymentSummaryPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated user who needs to join hostel */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireHostel={false}>
                  <HostelOnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Profile page (requires login) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireHostel={false}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Hostel-Scoped Features */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireHostel={true}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute requireHostel={true}>
                  <CreateOrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/join"
              element={
                <ProtectedRoute requireHostel={true}>
                  <JoinOrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute requireHostel={true}>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId/payments"
              element={
                <ProtectedRoute requireHostel={true}>
                  <PaymentSummaryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute requireHostel={true}>
                  <OrderHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
