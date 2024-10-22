"use client";

import { createContext, useState, useContext } from "react";
import { IJournal } from "@/lib/interfaces";
import DebugLayout from "@/components/ui/debug/Layout";
export interface ISearchContext {
  query: string;
  filteredEntries: IJournal[];
  handleSearch: (searchQuery: string, journals: IJournal[]) => void;
  setFilteredEntries: (journals: IJournal[]) => void;
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
  const [filteredEntries, setFilteredEntries] = useState<IJournal[]>([]);

  const handleSearch = (searchQuery: string, journals: IJournal[]) => {
    console.log("searchQuery", searchQuery);
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      const result = journals.filter(
        (journal: IJournal) =>
          journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          journal.entry.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("result", result);
      setFilteredEntries(result);
    } else {
      setFilteredEntries(journals); // Reset if search is cleared
    }
  };

  return (
    <SearchContext.Provider
      value={{ query, filteredEntries, handleSearch, setFilteredEntries }}
    >
      <DebugLayout position="bottom-left" />
      {children}
    </SearchContext.Provider>
  );
}
