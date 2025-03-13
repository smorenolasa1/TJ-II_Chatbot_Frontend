import React from "react";
import { useNavigate } from "react-router-dom";
import "./ReportPage.css";

const ReportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="report-page">
      <button className="back-button" onClick={() => navigate("/")}>⬅ Back</button>
      <h1>Report Generation</h1>
      <p>This page will generate a report.</p>
    </div>
  );
};

export default ReportPage;