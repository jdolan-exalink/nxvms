// ============================================================================
// MAIN APP COMPONENT
// Root component with routing and layout
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './core/store';
import { LoginScreen } from './auth/login-screen';
import { ServerSelector } from './auth/server-selector';
import { MainLayout } from './layout/main-layout';
import { LiveView } from './live-view/live-view';
import { PlaybackView } from './playback/playback-view';
import { EventsPanel } from './events/events-panel';
import { HealthDashboard } from './health/health-dashboard';
import { BookmarksManager } from './bookmarks/bookmarks-manager';
import { ExportManager } from './export/export-manager';
import { SettingsPage } from './settings/settings-page';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginScreen />
            </PublicRoute>
          }
        />
        <Route
          path="/servers"
          element={
            <PublicRoute>
              <ServerSelector />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="live" element={<LiveView />} />
          <Route path="playback" element={<PlaybackView />} />
          <Route path="events" element={<EventsPanel />} />
          <Route path="bookmarks" element={<BookmarksManager />} />
          <Route path="export" element={<ExportManager />} />
          <Route path="health" element={<HealthDashboard />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/live" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
