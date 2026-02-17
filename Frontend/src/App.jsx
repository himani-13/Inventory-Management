import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./pages/Navbar";

import ForecastPage from "./pages/ForecastPage";
import RiskDashboard from "./pages/RiskDashboard";
import AdminUpload from "./pages/AdminUpload";

export default function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/risk" element={<RiskDashboard />} />
        <Route path="/upload" element={<AdminUpload />} />
      </Routes>

    </BrowserRouter>
  );
}

