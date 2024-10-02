/**
 * the problem with local storage is if it's disabled the prompt'll show every time.
 * instead a db field is needed. however, i am not sure about sending a request to a database.
 */

import React from "react";

interface IProps {
  filled?: boolean; // Determines if the star is filled

  onClick?: () => void; // Click handler
}

const StarIcon: React.FC<IProps> = ({ filled = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center cursor-pointer`}
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
        fill={filled ? "var(--starFavorite)" : "none"}
        viewBox="0 0 24 24"
        stroke={filled ? "var(--starFavorite)" : "currentColor"}
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
