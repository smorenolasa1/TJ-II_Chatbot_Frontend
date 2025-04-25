import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportPage.css";

const ReportPage = () => {
  const navigate = useNavigate();
  const [reportReady, setReportReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [wordUrl, setWordUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportReady(false);
    setLog("Generating report...");

    try {
      const response = await fetch("http://localhost:5005/generate_report");
      if (!response.ok) throw new Error("Failed to generate report");

      const data = await response.json();
      if (data.pdf_url || data.word_url) {
        setPdfUrl(data.pdf_url);
        setWordUrl(data.word_url);
        setReportReady(true);
        setLog("Report generated successfully.");
      } else {
        setLog("Report generated but no files found.");
      }
    } catch (error) {
      console.error(error);
      setLog("An error occurred while generating the report.");
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
        setReportReady(false);
        setPdfUrl(null);
        setWordUrl(null);
        setLog("Context reset successfully.");
      } else {
        setLog("Error resetting context.");
      }
    } catch (error) {
      console.error(error);
      setLog("An error occurred while resetting the context.");
    }
  };

  return (
    <div className="report-page">
      <div className="header">
        <button className="back-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
        <h1>Fusion Report Generator</h1>
        <p className="description">
          Generates a detailed report based on your previous analysis sessions.
        </p>
      </div>

      <div className="actions">
        <button
          className="primary-button"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
        <button
          className="secondary-button"
          onClick={handleRestartContext}
          disabled={loading}
        >
          Reset Context
        </button>
      </div>

      {log && <div className="log">{log}</div>}

      {reportReady && (
        <div className="downloads">
          <h2>Download Report</h2>
          <div className="download-links">
            {pdfUrl && (
              <a
                href={pdfUrl}
                download
                className="download-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
            )}
            {wordUrl && (
              <a
                href={wordUrl}
                download
                className="download-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Word Document
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;