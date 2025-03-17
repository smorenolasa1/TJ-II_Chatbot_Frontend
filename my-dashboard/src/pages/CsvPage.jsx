import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CsvPage.css";

const CsvPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [clarifications, setClarifications] = useState([]);  // NEW state for clarifications
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modified handleSearch function to accept a question parameter.
  const handleSearch = async (question) => {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setResponse("");
    setClarifications([]); // Clear clarifications each time

    try {
      const res = await fetch("http://localhost:5002/get_csv_answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      console.log("Backend Response:", data); // Debug log

      if (data.clarification) {  // NEW: Handle clarifications from the backend
        setClarifications(data.clarification);
      } else if (data.answer) {
        if (typeof data.answer === "string") {
          setResponse(data.answer);
        } else if (Array.isArray(data.answer)) {
          const formattedResponse = data.answer
            .map((obj) =>
              Object.entries(obj)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")
            )
            .join("\n");
          setResponse(formattedResponse);
        }
      } else {
        setResponse("Unexpected response format.");
      }
    } catch (err) {
      setError("Error fetching response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Helper to handle clarification button clicks.
  const handleClarificationClick = (option) => {
    // Optionally, update the query input with the selected option
    setQuery(option);
    // Resubmit the clarified query.
    handleSearch(option);
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅ Back
      </button>

      <h1 className="csv-title">Ask questions about TJ-II database</h1>

      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Ask something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="search-button"
          onClick={() => handleSearch(query)}
          disabled={loading}
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* NEW: Render clarification buttons if clarification options exist */}
      {clarifications.length > 0 && (
        <div className="clarification-container">
          <p>Please clarify your question:</p>
          {clarifications.map((option, index) => (
            <button
              key={index}
              className="clarification-button"
              onClick={() => handleClarificationClick(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {response && <pre className="response">{response}</pre>}

      <button className="load-csv-button" onClick={() => navigate("/load-csv")}>
        Load New CSV
      </button>
    </div>
  );
};

export default CsvPage;