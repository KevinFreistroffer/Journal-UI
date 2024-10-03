"use client";
import React, { useState } from "react";
import "./StarIcon.css";

interface IProps {
  filled?: boolean; // Determines if the star is filled
  onClick?: () => void; // Click handler
  size?: "sm" | "md" | "lg";
}

const StarIcon: React.FC<IProps> = ({
  filled = false,
  onClick,
  size = "md",
}) => {
  const [isHovered, setIsHovered] = useState(false); // State for hover

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)} // Set hover state
      onMouseLeave={() => setIsHovered(false)} // Reset hover state
      className={`star-icon ${sizeClasses[size]} flex items-center justify-center cursor-pointer`}
      style={
        {
          // backgroundColor: backgroundColor,
          // border: `2px solid ${borderColor}`,
          // borderRadius: "50%", // Make it circular
        }
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isHovered || filled ? "var(--starFavorite)" : "none"} // Update fill based on hover
        viewBox="0 0 24 24"
        stroke={isHovered || filled ? "var(--starFavorite)" : "currentColor"} // Update stroke based on hover
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27z"
        />
      </svg>
    </div>
  );
};

export default StarIcon;
