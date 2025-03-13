import React from "react";
import "./Card.css"; // Import styles

const Card = ({ children }) => {
  return <div className="card">{children}</div>;
};

export default Card;