import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import ReportIssuePage from './pages/ReportIssuePage';
import MyReportsPage from './pages/MyReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import MapPage from './pages/MapPage';
import ParkingPage from './pages/ParkingPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AppearanceSettingsPage from './pages/AppearanceSettingsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import MunicipalDashboardPage from './pages/MunicipalDashboardPage';
import MunicipalIssuesPage from './pages/MunicipalIssuesPage';
import MunicipalTaskDetailPage from './pages/MunicipalTaskDetailPage';
import TrafficDashboardPage from './pages/TrafficDashboardPage';
import TrafficVerifyPage from './pages/TrafficVerifyPage';
import EmergencyDashboardPage from './pages/EmergencyDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import SupportDeskPage from './pages/SupportDeskPage';
import Forbidden403Page from './pages/Forbidden403Page';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-500">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

const RoleGuard = ({ allowedRoles, children }) => {
  const { user, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admins have universal superuser access
  if (user.role === 'ADMIN') {
    return children;
  }

  if (!hasRole(...allowedRoles)) {
    return (
      <Navigate
        to={`/403?attempted=${encodeURIComponent(location.pathname)}&required=${encodeURIComponent(
          allowedRoles.join(' / ')
        )}`}
        replace
      />
    );
  }

  return children;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Portal Layout Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/403" element={<Forbidden403Page />} />
              </Route>

              {/* Authenticated Application Workspace Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Citizen Routes */}
                <Route path="/citizen/dashboard" element={<CitizenDashboardPage />} />
                <Route path="/citizen/report" element={<ReportIssuePage />} />
                <Route path="/citizen/my-reports" element={<MyReportsPage />} />
                <Route path="/citizen/reports/:id" element={<ReportDetailPage />} />

                {/* Common Protected Views */}
                <Route path="/map" element={<MapPage />} />
                <Route path="/parking" element={<ParkingPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
                <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
                <Route path="/support" element={<SupportDeskPage />} />

                {/* Municipal Authority Routes */}
                <Route
                  path="/authority/dashboard"
                  element={
                    <RoleGuard allowedRoles={['MUNICIPAL_AUTHORITY']}>
                      <MunicipalDashboardPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/authority/issues"
                  element={
                    <RoleGuard allowedRoles={['MUNICIPAL_AUTHORITY']}>
                      <MunicipalIssuesPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/authority/tasks/:id"
                  element={
                    <RoleGuard allowedRoles={['MUNICIPAL_AUTHORITY']}>
                      <MunicipalTaskDetailPage />
                    </RoleGuard>
                  }
                />

                {/* Traffic Police Routes */}
                <Route
                  path="/traffic/dashboard"
                  element={
                    <RoleGuard allowedRoles={['TRAFFIC_AUTHORITY']}>
                      <TrafficDashboardPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/traffic/verify"
                  element={
                    <RoleGuard allowedRoles={['TRAFFIC_AUTHORITY']}>
                      <TrafficVerifyPage />
                    </RoleGuard>
                  }
                />

                {/* Emergency Services Routes */}
                <Route
                  path="/emergency/dashboard"
                  element={
                    <RoleGuard allowedRoles={['EMERGENCY_SERVICE']}>
                      <EmergencyDashboardPage />
                    </RoleGuard>
                  }
                />

                {/* Civic Analytics */}
                <Route
                  path="/analytics"
                  element={
                    <RoleGuard allowedRoles={['MUNICIPAL_AUTHORITY', 'TRAFFIC_AUTHORITY', 'EMERGENCY_SERVICE', 'ADMIN']}>
                      <AnalyticsPage />
                    </RoleGuard>
                  }
                />

                {/* System Administration Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminDashboardPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <AdminUsersPage />
                    </RoleGuard>
                  }
                />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
