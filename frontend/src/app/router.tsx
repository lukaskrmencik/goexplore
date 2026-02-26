import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { isUserAuthenticated } from "../utils/auth";

import MapViewerPage from "../pages/MapViewerPage";
import CreateRoutePage from "../pages/CreateRoutePage";
import RoutesPage from "../pages/RoutesPage";
import EquipmentPage from "../pages/EquipmentPage";
import UserAccountPage from "../pages/UserAccountPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import JoinRoutePage from "../pages/JoinRoutePage";

import { MainLayout } from "../components/layout/MainLayout/MainLayout";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isUserAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/join/:token" element={<JoinRoutePage />} />

        <Route path="/" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
        <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><UserAccountPage /></ProtectedRoute>} />
        <Route path="/routes/new" element={<ProtectedRoute><CreateRoutePage /></ProtectedRoute>} />
        <Route path="/routes/:routeId/:step" element={<ProtectedRoute><CreateRoutePage /></ProtectedRoute>} />
        <Route path="/map-viewer" element={<ProtectedRoute><MapViewerPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
