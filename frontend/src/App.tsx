import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import { DataProvider } from '@/context/DataContext';
import { SidebarProvider } from '@/context/SidebarContext';

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

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes (wrapped in PageShell layout) */}
          <Route element={<SidebarProvider><PageShell /></SidebarProvider>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/medications" element={<MedicationsPage />} />
            <Route path="/pharmacy-orders" element={<PharmacyOrdersPage />} />
            <Route path="/prior-authorizations" element={<PriorAuthPage />} />
            <Route path="/caregiver-alerts" element={<CaregiverAlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/care-circle" element={<CareCirclePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
