import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { PILOT_HOSTEL } from './utils/constants';

export const App: React.FC = () => {
  // Simple mock user session state for Phase 1
  const [currentUser, setCurrentUser] = useState<{
    displayName: string;
    role: string;
    email: string | null;
    hostelId?: string | null;
  } | null>({
    displayName: 'Ajay (Demo)',
    role: 'student',
    email: 'ajay.student@campus.edu',
    hostelId: PILOT_HOSTEL.id,
  });

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={currentUser} onSignOut={handleSignOut} />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<HostelOnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create" element={<CreateOrderPage />} />
          <Route path="/join" element={<JoinOrderPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/orders/:orderId/payments" element={<PaymentSummaryPage />} />
          <Route path="/history" element={<OrderHistoryPage />} />
          <Route
            path="/profile"
            element={<ProfilePage user={currentUser} onSignOut={handleSignOut} />}
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
