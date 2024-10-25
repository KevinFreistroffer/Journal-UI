"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "@/lib/interfaces";
import { getUser } from "@/lib/data_access_layer";
import { useSearch } from "@/context/SearchContext";

interface AuthStateType {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthState = createContext<AuthStateType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  setIsLoading: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setFilteredEntries } = useSearch();

  useEffect(() => {
    async function checkSession() {
      try {
        setIsLoading(true);
        const sessionUser = await getUser();

        if (!sessionUser) {
          setUser(null);
        } else {
          setUser(sessionUser);
          setFilteredEntries(sessionUser.journals);
        }
      } catch (error) {
        console.error("Error verifying session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, [setFilteredEntries]);

  return (
    <AuthState.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </AuthState.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthState);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
