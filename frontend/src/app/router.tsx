import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MapEditorPage from "../pages/MapEditorPage";
import CreateRoutePage from "../pages/CreateRoutePage";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/routes/new" element={<CreateRoutePage />} />
        <Route path="/map-editor" element={<MapEditorPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
