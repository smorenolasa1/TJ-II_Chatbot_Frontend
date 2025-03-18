import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoadCsvPage.css";

const LoadCsvPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [startRow, setStartRow] = useState(0);
  const [endRow, setEndRow] = useState(500);
  const MAX_ROWS = 500; // AI processing limit

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    // Read CSV for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").slice(0, 6).map(row => row.split(",")); // Show first 5 rows
      setPreviewData(rows);
    };
    reader.readAsText(selectedFile);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8501/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResponse("✅ CSV uploaded successfully!");
        setTotalRows(data.total_rows);
        setStartRow(0);
        setEndRow(Math.min(MAX_ROWS, data.total_rows)); // Ensure it doesn't exceed total rows
      }
    } catch (error) {
      setError("❌ Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  // Handle question submission
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8501/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, start_row: startRow, end_row: endRow }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResponse(data.response);
      }
    } catch (error) {
      setError("❌ Error processing the question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/csv")}>⬅ Back</button>
      <h1>Upload and Analyze a CSV</h1>
      <p>Drop a CSV file below or click to upload.</p>

      {/* Drag and Drop CSV */}
      <div 
        className="drop-zone" 
        onClick={() => document.getElementById("file-input").click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileChange({ target: { files: e.dataTransfer.files } });
        }}
      >
        <input 
          id="file-input"
          type="file"
          className="file-input"
          onChange={handleFileChange} 
        />
        <p>Drag & Drop or Click to Upload</p>
      </div>

      {/* Show Preview if CSV is uploaded */}
      {previewData.length > 0 && (
        <div className="csv-preview">
          <h2>CSV Preview:</h2>
          <table>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Button */}
      <button className="upload-button" onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {/* Row Selection */}
      {totalRows > MAX_ROWS && (
        <div className="row-selector">
          <p>⚠️ Your dataset has {totalRows} rows. AI can only process {MAX_ROWS} rows at a time.</p>
          <label>Start Row: {startRow}</label>
          <input type="range" min="0" max={totalRows} value={startRow} onChange={(e) => setStartRow(Number(e.target.value))} />
          
          <label>End Row: {endRow}</label>
          <input type="range" min="0" max={totalRows} value={endRow} onChange={(e) => setEndRow(Number(e.target.value))} />
        </div>
      )}

      {/* Question Input */}
      <div className="question-section">
        <input
          type="text"
          className="question-input"
          placeholder="Ask something about the dataset..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button className="ask-button" onClick={handleAskQuestion} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* AI Response */}
      {response && (
        <div className="response-container">
          <h2>AI Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default LoadCsvPage;