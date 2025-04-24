import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlotPage.css";

const PlotPage = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState("");  // Single input for both tools
  const [similarSignals, setSimilarSignals] = useState([]);
  const [aiResponse, setAiResponse] = useState("");  // AI response for SimilPatternTool
  const [plotUrl, setPlotUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTool, setSelectedTool] = useState("SimilPatternTool");
  const [history, setHistory] = useState(() => {
    const savedHistory = sessionStorage.getItem("chatHistoryPlot");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  // Function to switch tools and reset results
  const handleToolChange = (tool) => {
    setSelectedTool(tool);
    setSimilarSignals([]);
    setAiResponse("");
    setPlotUrl(null);
    setError("");
  };

  // Handle fetching data from backend
  const handleSearch = async () => {
    if (!userInput.trim()) {
      setError("Please enter a valid query.");
      return;
    }
  
    setLoading(true);
    setError("");
    setSimilarSignals([]);
    setAiResponse("");
    setPlotUrl(null);
  
    let apiUrl;
    let requestBody;
  
    if (selectedTool === "TJ-II data display") {
      apiUrl = "http://localhost:5003/get_tjii_plot";
      requestBody = { user_query: userInput };
  
      console.log("📡 Sending Request to TJ-II Backend:", apiUrl, requestBody);
  
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          mode: "cors",
        });
  
        if (!response.ok) throw new Error("Failed to fetch data");
  
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPlotUrl(url);
  
        setHistory(prevHistory => {
          const updatedHistory = [...prevHistory, { question: userInput, plot: url }];
          sessionStorage.setItem("chatHistoryPlot", JSON.stringify(updatedHistory));
          return updatedHistory;
        });
  
      } catch (error) {
        setError("Failed to fetch TJ-II data. Please try again.");
        console.error("❌ Error:", error);
      } finally {
        setLoading(false);
      }
  
      return; 
    }
  
    const apiUrlExtract = "http://localhost:5004/extract_shot_number_and_database";
    const requestBodyExtract = { user_query: userInput };
  
    console.log("📡 Sending Request to Extract Shot Number:", apiUrlExtract, requestBodyExtract);
  
    try {
      const responseExtract = await fetch(apiUrlExtract, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBodyExtract),
        mode: "cors",
      });
  
      if (!responseExtract.ok) throw new Error("Failed to extract shot number and database name");
  
      const extractData = await responseExtract.json();
      const extractedShotNumber = extractData.shot_number;
      const extractedDatabaseName = extractData.database_name; // ✅ Extracting database_name
  
      if (!extractedShotNumber || !extractedDatabaseName) { // ✅ Check for both values
        setError("Could not determine the shot number or database name. Please specify them.");
        setLoading(false);
        return;
      }
  
      console.log(`📡 Extracted shot number: ${extractedShotNumber}`);
      console.log(`📡 Extracted database name: ${extractedDatabaseName}`);
  
      apiUrl = "http://localhost:5004/ask_gemini";
      requestBody = { 
        shot_number: extractedShotNumber, 
        question: userInput,
        database_name: extractedDatabaseName // ✅ Include database_name in the request
      };
  
      console.log("📡 Sending Request to SimilPatternTool Backend:", apiUrl, requestBody);
  
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        mode: "cors",
      });
  
      if (!response.ok) throw new Error("Failed to fetch data");
  
      const data = await response.json();
      setAiResponse(data.response || "No response from AI.");
      setPlotUrl(data.plot_url || null);
  
      setHistory(prevHistory => {
        const updatedHistory = [...prevHistory, { question: userInput, answer: data.response, plot: data.plot_url }];
        sessionStorage.setItem("chatHistoryPlot", JSON.stringify(updatedHistory));
        return updatedHistory;
      });
  
    } catch (error) {
      setError("Failed to fetch SimilPatternTool data. Please try again.");
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle plot download
  const handleDownload = (plotUrl) => {
    if (!plotUrl) {
      setError("No plot available for download.");
      return;
    }
  
    try {
      fetch(plotUrl)
        .then(response => response.blob())
        .then(blob => {
          const a = document.createElement("a");
          const url = URL.createObjectURL(blob);
          a.href = url;
          a.download = "generated_plot.png";  // ✅ Set correct filename
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);  // ✅ Free memory after download
        });
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

      {/* Single Search Input */}
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Ask a question or enter a shot number..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Ask"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Display chat history */}
      {history.length > 0 && (
        <div className="chat-box">
          {history.map((entry, index) => (
            <div key={index} className="chat-message-container">
              {/* User Question (Right Side) */}
              <div className="chat-message user-message">
                <strong>You:</strong> {entry.question}
              </div>

              {/* Bot Response (Left Side) */}
              {entry.answer && (
                <div className="chat-message bot-message">
                  <strong>Bot:</strong>
                  <p dangerouslySetInnerHTML={{ 
                    __html: entry.answer
                      .replace(/\n/g, "<br>")   // ✅ Preserve line breaks
                      .replace(/\* (.+?)/g, "• $1")  // ✅ Convert * to bullet points
                  }}></p>
                </div>
              )}

              {/* ✅ Separate Box for Generated Plot (Left Side) */}
              {entry.plot && (
                <div className="chat-message bot-message">
                  <h2>Generated Plot</h2>
                  <img src={entry.plot} alt="Generated Plot" className="plot-image" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {plotUrl && (
        <div className="download-container">
          <button className="download-button" onClick={() => handleDownload(plotUrl)}>
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
            View TJ-II Data
          </a>
        </div>
      )}
      <div className="example-prompts">
        <h3>Example Prompts:</h3>
        <ul>
            <li> ¿Cuántas descargas se han hecho el día xx/xx/xxxx?</li>
            <li> ¿Cuántas descargas se han hecho en el mes de xxxxxx?</li>
            <li> ¿Qué año se hicieron más descargas?</li>
        </ul>
        </div>
    </div>
  );
};

export default PlotPage;