"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { IJournal } from "@/lib/interfaces";
interface JournalStateType {
  selectedJournal: IJournal | null;
  setSelectedJournal: (journal: IJournal | null) => void;
}

const JournalState = createContext<JournalStateType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [selectedJournal, setSelectedJournal] = useState<IJournal | null>(null);

  return (
    <JournalState.Provider value={{ selectedJournal, setSelectedJournal }}>
      {children}
    </JournalState.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalState);
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
}
