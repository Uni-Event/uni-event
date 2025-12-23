import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import NotFoundPage from "./pages/NotFoundPage";
import AuthPage from "./pages/AuthPage";
import DashboardWrapper from "./pages/DashboardWrapper";
import OrganizerDashboardPage from "./pages/OrganizerDashboardPage";

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
          path="/organizer/dashboard" 
          element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerDashboardPage />
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