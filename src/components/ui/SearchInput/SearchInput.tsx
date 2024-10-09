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
      {" "}
      {/* Added relative positioning for the input wrapper */}
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value, userEntries)}
        placeholder="Search journals..."
        className={`border rounded p-2 pr-10 ${className}`} // Added padding to the right for the icon
      />
      <span
        onClick={handleClear}
        className="absolute right-10 text-2xl text-grey-400 top-1/2 transform -translate-y-1/2 cursor-pointer" // Positioned the icon within the input
      >
        &times; {/* This represents the "X" icon */}
      </span>
    </div>
  );
};

export default SearchInput;
