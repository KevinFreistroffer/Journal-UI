import React from "react";

interface SearchInputProps {
  query: string;
  handleSearch: (value: string, journals: any[]) => void; // Adjust the type as necessary
  userEntries: any[]; // Adjust the type as necessary
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  query,
  handleSearch,
  userEntries,
  className,
}) => {
  // New function to handle clear action
  const handleClear = () => {
    handleSearch("", userEntries); // Clear the search input
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value, userEntries)}
        placeholder="Search journals..."
        className={`border rounded p-2  pr-8 text-sm ${className}`}
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
