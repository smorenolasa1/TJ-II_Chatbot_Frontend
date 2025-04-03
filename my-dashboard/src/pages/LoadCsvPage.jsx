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
  const [history, setHistory] = useState(() => {
    const savedHistory = sessionStorage.getItem("chatHistoryCsv");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [csvUploaded, setCsvUploaded] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").slice(0, 6).map(row => row.split(","));
      setPreviewData(rows);
    };
    reader.readAsText(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewData([]);
    setResponse("");
    setError("");
    setTotalRows(0);
    setStartRow(0);
    setEndRow(500);
    setCsvUploaded(false);
  };

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
      const res = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResponse("CSV uploaded successfully!");
        setTotalRows(data.total_rows);
        setStartRow(0);
        setEndRow(Math.min(MAX_ROWS, data.total_rows));
        setCsvUploaded(true);
      }
    } catch (error) {
      setError("❌ Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartRowChange = (e) => {
    let newStart = Number(e.target.value);
    let newEnd = Math.min(newStart + MAX_ROWS, totalRows);

    setStartRow(newStart);
    setEndRow(newEnd);
  };

  const handleEndRowChange = (e) => {
    let newEnd = Number(e.target.value);
    let newStart = Math.max(0, newEnd - MAX_ROWS);

    setEndRow(newEnd);
    setStartRow(newStart);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const res = await fetch("http://localhost:5001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, start_row: startRow, end_row: endRow }),
      });
  
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const botResponse = data.response;
        setResponse(botResponse);
  
        // ✅ Save question and response in history
        setHistory(prevHistory => {
          const updatedHistory = [...prevHistory, { question, answer: botResponse }];
          sessionStorage.setItem("chatHistoryCsv", JSON.stringify(updatedHistory));
          return updatedHistory;
        });
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
      <h1>Ask about your CSV</h1>
  
      {!csvUploaded ? (
        !file ? (
          <>
            <p>Drop a CSV file below or click to upload.</p>
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
          </>
        ) : (
          <>
            <div className="csv-preview-container">
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
              <button className="remove-file-button" onClick={handleRemoveFile}>❌</button>
            </div>
  
            <button className="upload-button" onClick={handleUpload} disabled={loading}>
              {loading ? "Uploading..." : "Upload CSV"}
            </button>
          </>
        )
      ) : (
        <>
          {totalRows > MAX_ROWS && (
            <div className="row-selector">
              <p>Dataset has {totalRows} rows. Chatbot can only process 500 rows at a time.</p>
              <label>Start Row: {startRow}</label>
              <input type="range" min="0" max={totalRows - MAX_ROWS} value={startRow} onChange={handleStartRowChange} />
              
              <label>End Row: {endRow}</label>
              <input type="range" min={MAX_ROWS} max={totalRows} value={endRow} onChange={handleEndRowChange} />
            </div>
          )}
  
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
  
          <button className="reupload-button" onClick={handleRemoveFile}>Upload New CSV</button>
        </>
      )}
  
      {error && <p className="error-message">{error}</p>}
  
      {/* Display chat history */}
      {/* Display chat history */}
      {history.length > 0 && (
        <div className="chat-box">
          {history.map((entry, index) => (
            <div key={index} className="chat-message-container">
              <div className="chat-message user-message">
                <strong>You:</strong> {entry.question}
              </div>
              <div className="chat-message bot-message">
                <strong>Bot:</strong> 
                <p dangerouslySetInnerHTML={{ 
                  __html: entry.answer.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>") 
                }}></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Reset Chat History Button (at the end) */}
      {history.length > 0 && (
        <button className="clear-history-button" onClick={() => {
          setHistory([]);
          sessionStorage.removeItem("chatHistoryCsv");
        }}>
          Reset Chat History
        </button>
      )}
    </div>
  );
};

export default LoadCsvPage;