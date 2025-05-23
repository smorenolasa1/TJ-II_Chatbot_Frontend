import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">TJ-II Chatbot</h1>
      <div className="dashboard-grid">
        <Card>
          <Button onClick={() => navigate("/csv")}>Retrieve CSV</Button>
        </Card>
        <Card>
          <Button onClick={() => navigate("/report")}>Generate Report</Button>
        </Card>
        <Card>
          <Button onClick={() => navigate("/plot")}>Plot Data</Button>
        </Card>
      </div>

      {/* Logo at the bottom */}
      <div className="logo-container">
        <img src="/ciematlogo.jpeg" alt="Ciemat Logo" className="logo" />
      </div>
    </div>
  );
};

export default Dashboard;