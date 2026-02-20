import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MapViewerPage from "../pages/MapViewerPage";
import CreateRoutePage from "../pages/CreateRoutePage";
import HomePage from "../pages/HomePage";
import EquipmentPage from "../pages/EquipmentPage";
import UserAccountPage from "../pages/UserAccountPage";

import { MainLayout } from "../components/layout/MainLayout";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/account" element={<UserAccountPage />} />
          <Route path="/routes/new" element={<CreateRoutePage />} />
          <Route path="/routes/:routeId/:step" element={<CreateRoutePage />} />
          <Route path="/map-viewer" element={<MapViewerPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
