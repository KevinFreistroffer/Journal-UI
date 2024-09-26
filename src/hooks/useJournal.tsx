"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { IJournal } from "@/lib/interfaces";
interface JournalContextType {
  selectedJournal: IJournal | null;
  setSelectedJournal: (journal: IJournal | null) => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [selectedJournal, setSelectedJournal] = useState<IJournal | null>(null);

  return (
    <JournalContext.Provider value={{ selectedJournal, setSelectedJournal }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
}
