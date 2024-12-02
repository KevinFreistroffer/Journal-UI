"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "@/lib/interfaces";
import { getUser } from "@/lib/data_access_layer";
import { useSearch } from "@/context/SearchContext";
import { initializeSession } from "@/lib/sessionManager";
import { useRouter } from "next/navigation";

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
  console.log("AuthProvider() initializing");
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setFilteredEntries } = useSearch();

  const handleSetUser = (newUser: IUser | null) => {
    setUser(newUser);

    return newUser;
  };

  useEffect(() => {
    initializeSession(handleSetUser, setFilteredEntries)
      .then((newUser: IUser | null) => {
        console.log("FINALLY");

        if (!newUser) {
          router.push("/login");
        }
      })
      .finally(() => setIsLoading(false));
  }, [setFilteredEntries, router]);

  return (
    <AuthState.Provider
      value={{
        user,
        setUser: handleSetUser as React.Dispatch<
          React.SetStateAction<IUser | null>
        >,
        isLoading,
        setIsLoading,
      }}
    >
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
