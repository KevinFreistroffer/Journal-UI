import React, { useLayoutEffect } from "react";

interface IProps {
  id: string;
  query: string;
  handleSearch: (value: string, journals: any[]) => void; // Adjust the type as necessary
  userEntries: any[]; // Adjust the type as necessary
  containerClassName?: string;
  inputClassName?: string;
  placeholder?: string;
}

const SearchInput: React.FC<IProps> = ({
  id,
  query,
  handleSearch,
  userEntries,
  containerClassName = "",
  inputClassName = "",
  placeholder = "Search journals...",
}) => {
  // New function to handle clear action
  const handleClear = () => {
    handleSearch("", userEntries); // Clear the search input
  };

  return (
    <div className={` relative ${containerClassName} `}>
      <input
        id={id}
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value, userEntries)}
        placeholder={placeholder}
        className={`border rounded p-2 pr-8 text-sm focus-visible:outline-none focus-visible:border-blue-500 dark:focus-visible:border-gray-500 ${inputClassName}`}
      />
      <span
        onClick={handleClear}
        className="absolute right-2 text-lg text-gray-400 top-1/2 transform -translate-y-1/2 cursor-pointer"
      >
        &times;
      </span>
    </div>
  );
};

export default SearchInput;
