import React from "react";
import { useNavigate } from "react-router-dom";
import "./PlotPage.css";

const PlotPage = () => {
  const navigate = useNavigate();

  return (
    <div className="plot-page">
      <button className="back-button" onClick={() => navigate("/")}>⬅ Back</button>
      <h1>Plot Data</h1>
      <p>This page will display a plot of the data.</p>
    </div>
  );
};

export default PlotPage;