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
  const [selectedTool, setSelectedTool] = useState("SimilPatternTool");

  // Function to switch tools and reset results
  const handleToolChange = (tool) => {
    setSelectedTool(tool);
    setSimilarSignals([]);
    setPlotUrl(null);
    setError("");
  };

  // Handle fetching data from backend
  const handleSearch = async () => {
    if (!shotNumber.trim()) {
      setError("Please enter a valid shot number.");
      return;
    }
  
    setLoading(true);
    setError("");
    setSimilarSignals([]);
    setPlotUrl(null);
  
    const apiUrl =
      selectedTool === "SimilPatternTool"
        ? "http://localhost:5000/get_similar_signals"
        : "http://localhost:5001/get_tjii_plot";  // ✅ Ensure it uses the correct backend
  
    const requestBody =
      selectedTool === "SimilPatternTool"
        ? { shot_number: shotNumber }
        : { user_query: `${shotNumber}` };
  
    console.log("📡 Sending Request to Backend:", apiUrl, requestBody);  // ✅ Debugging line
  
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        mode: "cors",
      });
  
      console.log("📡 Backend Response:", response.status);  // ✅ Debugging line
  
      if (!response.ok) throw new Error("Failed to fetch data");
  
      if (selectedTool === "SimilPatternTool") {
        const data = await response.json();
        setSimilarSignals(data.similar_signals || []);
        setPlotUrl(data.plot_url || null);
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPlotUrl(url);
      }
    } catch (error) {
      setError("Failed to fetch data. Please try again.");
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle plot download
  const handleDownload = async () => {
    if (!plotUrl) {
      setError("No plot available for download.");
      return;
    }

    try {
      const a = document.createElement("a");
      a.href = plotUrl;
      a.download = `tjii_plot_${shotNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      setError("Error downloading the plot.");
      console.error("Download error:", error);
    }
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/")}>⬅ Back</button>

      <h1 className="plot-title">Simil Pattern Tool Chatbot</h1>

      {/* Toggle Buttons */}
      <div className="toggle-buttons">
        <button
          className={selectedTool === "SimilPatternTool" ? "active" : ""}
          onClick={() => handleToolChange("SimilPatternTool")}
        >
          SimilPatternTool
        </button>
        <button
          className={selectedTool === "TJ-II data display" ? "active" : ""}
          onClick={() => handleToolChange("TJ-II data display")}
        >
          TJ-II data display
        </button>
      </div>

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
      {selectedTool === "SimilPatternTool" && similarSignals.length > 0 && (
        <div className="response">
          <h2>Similar Signals</h2>
          <ul className="signal-list">
            {similarSignals.map((sig, index) => (
              <li key={index}>Shot {sig.shot}: Confidence {sig.confidence?.toFixed(4)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Plot + Download Button */}
      {plotUrl && (
        <div className="plot-container">
          <h2>Generated Plot</h2>
          <img src={plotUrl} alt="Generated Plot" className="plot-image" />
          <br />
          <button className="download-button" onClick={handleDownload}>
            ⬇ Download Plot
          </button>
        </div>
      )}

      {/* Display link when TJ-II data display is selected */}
      {selectedTool === "TJ-II data display" && (
        <div className="info-link">
          <p>info.fusion.ciemat.es:</p>
          <a
            href={`https://info.fusion.ciemat.es/cgi-bin/TJII_data.cgi`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View TJ-II Data for Shot {shotNumber}
          </a>
        </div>
      )}
    </div>
  );
};

export default PlotPage;