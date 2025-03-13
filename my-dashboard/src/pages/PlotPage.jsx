import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlotPage.css";

const PlotPage = () => {
  const navigate = useNavigate();
  const [shotNumber, setShotNumber] = useState("");
  const [similarSignals, setSimilarSignals] = useState([]);
  const [plotUrl, setPlotUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setSimilarSignals([]);
    setPlotUrl(null);

    try {
      const response = await fetch("http://localhost:5000/get_similar_signals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shot_number: shotNumber }),
        mode: "cors",
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setSimilarSignals(data.similar_signals);
      setPlotUrl(data.plot_url);
    } catch (error) {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Function to force download the image
  const handleDownload = async () => {
    if (!plotUrl) return;

    try {
      const response = await fetch(plotUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "similar_signals_plot.png"; // ✅ Correct filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the plot:", error);
    }
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/")}>⬅ Back</button>
      
      <h1 className="plot-title">Simil Pattern Tool Chatbot</h1>

      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Enter a shot number..."
          value={shotNumber}
          onChange={(e) => setShotNumber(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Ask"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Similar signals list */}
      {similarSignals.length > 0 && (
        <div className="response">
          <h2>Similar Signals</h2>
          <ul className="signal-list">
            {similarSignals.map((sig, index) => (
              <li key={index}>Shot {sig.shot}: Confidence {sig.confidence.toFixed(4)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Plot + Download Button */}
      {plotUrl && (
        <div className="plot-container">
          <h2>Generated Plot</h2>
          <img src={plotUrl} alt="Similar Signals Plot" className="plot-image" />
          <br />
          <button className="download-button" onClick={handleDownload}>
            ⬇ Download Plot
          </button>
        </div>
      )}
    </div>
  );
};

export default PlotPage;