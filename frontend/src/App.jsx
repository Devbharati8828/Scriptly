import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { SidebarProvider } from '@/context/SidebarContext';
import PageShell from '@/components/layout/PageShell';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import MedicationsPage from '@/pages/MedicationsPage';
import PharmacyOrdersPage from '@/pages/PharmacyOrdersPage';
import PriorAuthPage from '@/pages/PriorAuthPage';
import CaregiverAlertsPage from '@/pages/CaregiverAlertsPage';
import ReportsPage from '@/pages/ReportsPage';
import CareCirclePage from '@/pages/CareCirclePage';
import SettingsPage from '@/pages/SettingsPage';
import OnboardingPage from '@/pages/OnboardingPage';
import { useData } from '@/context/DataContext';

/** Redirects unauthenticated users to /login */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const { currentUser, loading } = useData();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!loading && currentUser && !currentUser.onboardingComplete && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

/** Redirects already-authenticated users away from login/signup */
function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"  element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected — wrapped in PageShell layout */}
      <Route
        element={
          <ProtectedRoute>
            <SidebarProvider>
              <PageShell />
            </SidebarProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"            element={<DashboardPage />} />
        <Route path="/medications"          element={<MedicationsPage />} />
        <Route path="/pharmacy-orders"      element={<PharmacyOrdersPage />} />
        <Route path="/prior-authorizations" element={<PriorAuthPage />} />
        <Route path="/caregiver-alerts"     element={<CaregiverAlertsPage />} />
        <Route path="/reports"              element={<ReportsPage />} />
        <Route path="/care-circle"          element={<CareCirclePage />} />
        <Route path="/settings"             element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
