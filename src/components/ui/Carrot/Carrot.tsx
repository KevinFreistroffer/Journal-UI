import React from "react";
import "./Carrot.css";

const Carrot: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={`carrot ${className}`}></div>;
};

export default Carrot;
