"use client";

import { createContext, useState, useContext } from "react";
import { IEntry } from "@/types/IEntry";

export interface ISearchContext {
  query: string;
  filteredEntries: IEntry[];
  handleSearch: (searchQuery: string, entries: IEntry[]) => void;
  setFilteredEntries: (entries: IEntry[]) => void;
}

const SearchContext = createContext<ISearchContext>({
  query: "",
  filteredEntries: [],
  handleSearch: () => {},
  setFilteredEntries: () => {},
});

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  const [query, setQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState<IEntry[]>([]);

  const handleSearch = (searchQuery: string, entries: IEntry[]) => {
    console.log("searchQuery", searchQuery);
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      const result = entries.filter(
        (entry: IEntry) =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.entry.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("result", result);
      setFilteredEntries(result);
    } else {
      setFilteredEntries(entries); // Reset if search is cleared
    }
  };

  return (
    <SearchContext.Provider
      value={{ query, filteredEntries, handleSearch, setFilteredEntries }}
    >
      {children}
    </SearchContext.Provider>
  );
}
