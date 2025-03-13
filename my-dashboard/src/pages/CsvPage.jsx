import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CsvPage.css";

const CsvPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSearch = () => {
    setResponse(`Chatbot response for: "${query}"`);
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate("/")}>⬅ Back</button>
      
      <h1 className="csv-title">Ask questions about TJ-II database</h1>

      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Ask something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>Ask</button>
      </div>

      {response && <p className="response">{response}</p>}

      <button className="load-csv-button" onClick={() => navigate("/load-csv")}>
        Load New CSV
      </button>
    </div>
  );
};

export default CsvPage;