import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CsvPage.css";

const CsvPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [clarifications, setClarifications] = useState({}); // Store categories and options
  const [selectedOptions, setSelectedOptions] = useState({}); // Store user selections
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]); // Guarda el historial de preguntas

  const handleSearch = async (question) => {
    if (!question.trim()) return;
  
    setHistory(prevHistory => [...prevHistory, question]); // Save history
  
    setLoading(true);
    setError("");
    setResponse("");
    setClarifications({});
    setSelectedOptions({});
  
    try {
      const res = await fetch("http://localhost:5002/get_csv_answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question, parameters: {} }), // ✅ Fix: Ensure correct payload format
      });
  
      if (!res.ok) throw new Error("Failed to fetch response");
  
      const data = await res.json();
      console.log("Backend Response:", data);
  
      if (data.clarification) {
        const parsedClarifications = {};
        data.clarification.forEach(item => {
          const [category, options] = item.split(": ");
          parsedClarifications[category] = options.split(", ");
        });
  
        setClarifications(parsedClarifications);
      } else if (typeof data.answer === "string") {
        setResponse(data.answer);
      } else if (Array.isArray(data.answer)) {
        const formattedResponse = data.answer.map(obj =>
          Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join(", ")
        ).join("\n");
  
        setResponse(formattedResponse);
      } else {
        setResponse("Unexpected response format.");
      }
    } catch (err) {
      setError("Error fetching response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle selection of options
  const handleOptionSelection = (category, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [category]: option,
    }));
  };

  // Send final selected options to the backend
  const handleSendSelections = () => {
    const formattedSelection = Object.entries(selectedOptions)
      .map(([category, option]) => `${category}: ${option}`)
      .join(", ");

    handleSearch(formattedSelection);
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
      {/* Sección única de chat con historial y respuesta */}
      {(history.length > 0 || response) && (
        <div className="chat-box">
          {history.map((q, index) => (
            <div key={index} className="chat-message user-message">
              <strong>You:</strong> {q}
            </div>
          ))}
          
          {response && (
            <div className="chat-message bot-message">
              <strong>Bot:</strong> 
              <p dangerouslySetInnerHTML={{ 
                __html: response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>") 
              }}></p>
            </div>
          )}
        </div>
      )}
      {/* Render clarification buttons if clarification options exist */}
      {Object.keys(clarifications).length > 0 && (
        <div className="clarification-container">
          <p>Please clarify your question:</p>
          {Object.entries(clarifications).map(([category, options]) => (
            <div key={category} className="clarification-category">
              <p>{category}:</p>
              {options.map((option) => (
                <button
                  key={option}
                  className={`clarification-button ${selectedOptions[category] === option ? "selected" : ""}`}
                  onClick={() => handleOptionSelection(category, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Show "Send Selected Options" button when all selections are made */}
      {Object.keys(selectedOptions).length === Object.keys(clarifications).length &&
        Object.keys(clarifications).length > 0 && (
            <button className="send-button" onClick={handleSendSelections}>
              Send Selected Options
            </button>
      )}
      <button className="load-csv-button" onClick={() => navigate("/load-csv")}>
        Load New CSV
      </button>
      {/* Example Prompts Section */}
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

export default CsvPage;