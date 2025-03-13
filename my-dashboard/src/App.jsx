import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CsvPage from "./pages/CsvPage";
import ReportPage from "./pages/ReportPage";
import PlotPage from "./pages/PlotPage";
import LoadCsvPage from "./pages/LoadCsvPage"; // Make sure this is correct

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/csv" element={<CsvPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/plot" element={<PlotPage />} />
      <Route path="/load-csv" element={<LoadCsvPage />} /> {/* Ensure this is working */}
    </Routes>
  );
};

export default App;