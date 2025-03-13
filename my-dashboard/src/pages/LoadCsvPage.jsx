import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoadCsvPage.css";

const LoadCsvPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/csv")}>⬅ Back</button>
      <h1>Upload a New CSV</h1>
      <p>Here you can load a new CSV file.</p>
      <input type="file" className="file-input" />
      <button className="upload-button">Upload</button>
    </div>
  );
};

export default LoadCsvPage;