import React, { useLayoutEffect } from "react";

interface IProps {
  query: string;
  handleSearch: (value: string, journals: any[]) => void; // Adjust the type as necessary
  userEntries: any[]; // Adjust the type as necessary
  containerClassName?: string;
  inputClassName?: string;
}

const SearchInput: React.FC<IProps> = ({
  query,
  handleSearch,
  userEntries,
  containerClassName = "",
  inputClassName = "",
}) => {
  // New function to handle clear action
  const handleClear = () => {
    handleSearch("", userEntries); // Clear the search input
  };

  return (
    <div className={` relative ${containerClassName} `}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value, userEntries)}
        placeholder="Search journals..."
        className={`border rounded p-2 pr-8 text-sm ${inputClassName}`}
      />
      <span
        onClick={handleClear}
        className="absolute right-6 text-lg text-gray-400 top-1/2 transform -translate-y-1/2 cursor-pointer"
      >
        &times;
      </span>
    </div>
  );
};

export default SearchInput;
