"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { IEntry } from "@/lib/interfaces";
interface EntryStateType {
  selectedEntry: IEntry | null;
  setSelectedEntry: (entrie: IEntry | null) => void;
}

const EntryState = createContext<EntryStateType | undefined>(undefined);

export function EntryProvider({ children }: { children: ReactNode }) {
  const [selectedEntry, setSelectedEntry] = useState<IEntry | null>(null);

  return (
    <EntryState.Provider value={{ selectedEntry, setSelectedEntry }}>
      {children}
    </EntryState.Provider>
  );
}

export function useEntry() {
  const context = useContext(EntryState);
  if (context === undefined) {
    throw new Error("useEntry must be used within a EntryProvider");
  }
  return context;
}
