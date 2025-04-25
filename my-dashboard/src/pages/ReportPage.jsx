import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportPage.css";

const ReportPage = () => {
  const navigate = useNavigate();
  const [reportReady, setReportReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [wordUrl, setWordUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportReady(false);
    try {
      const response = await fetch("http://localhost:5005/generate_report");
      console.log("📡 Raw response:", response);
  
      if (!response.ok) {
        console.error("❌ Backend returned error:", response.status);
        throw new Error("Failed to generate report");
      }
  
      const data = await response.json();
      console.log("✅ Backend returned data:", data);
  
      if (data.pdf_url || data.word_url) {
        setPdfUrl(data.pdf_url);
        setWordUrl(data.word_url);
        setReportReady(true);
      } else {
        alert("⚠️ Report generated but no URLs returned.");
      }
  
    } catch (error) {
      console.error("❌ Error in handleGenerateReport:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestartContext = async () => {
    try {
      const res = await fetch("http://localhost:5005/reset_context", {
        method: "POST",
      });
      if (res.ok) {
        alert("✅ Context reset successfully!");
        setReportReady(false);
        setPdfUrl(null);
        setWordUrl(null);
      } else {
        alert("❌ Error resetting context.");
      }
    } catch (error) {
      console.error("❌ Error resetting context:", error);
    }
  };

  return (
    <div className="report-page">
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅ Back
      </button>

      <h1>📄 Report Generator</h1>
      <p>Generate and download a complete fusion data analysis report.</p>

      <button className="generate-button" onClick={handleGenerateReport} disabled={loading}>
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {reportReady && (
        <div className="download-section">
          <h3>📂 Download your report:</h3>
          {pdfUrl && (
            <a href={pdfUrl} download className="download-link" target="_blank" rel="noopener noreferrer">
              📥 Download PDF
            </a>
          )}
          {wordUrl && (
            <a href={wordUrl} download className="download-link" target="_blank" rel="noopener noreferrer">
              📝 Download Word
            </a>
          )}
        </div>
      )}

      <button className="restart-button" onClick={handleRestartContext}>
        🔁 Restart Context
      </button>
    </div>
  );
};

export default ReportPage;