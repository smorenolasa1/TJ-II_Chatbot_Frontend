import React from "react";
import "./Button.css"; // Import styles

const Button = ({ onClick, children }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;