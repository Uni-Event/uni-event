import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import NotFoundPage from "./pages/NotFoundPage";
import AuthPage from "./pages/AuthPage";
import DashboardWrapper from "./pages/DashboardWrapper";

import OrganizerDashboardPage from "./pages/OrganizerDashboardPage";
import OrganizerScanPage from "./pages/OrganizerScanPage";
import OrganizerScanEventPage from "./pages/OrganizerScanEventPage";
import OrganizerStatisticsPage from "./pages/OrganizerStatisticsPage";

import FavoritesPage from "./pages/FavoritesPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import ProfilePage from "./pages/ProfilePage";

function Logout() {
  localStorage.clear();

  return <Navigate to="/" />;
}

function RegisterAndLogout() {
  localStorage.clear();

  return <AuthPage />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardWrapper />
            </ProtectedRoute>
          }
        />

        <Route
          path="my-tickets"
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/scan"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerScanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/scan/:eventId"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerScanEventPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/stats"
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerStatisticsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/auth" element={<RegisterAndLogout />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;