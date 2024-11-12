"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ViewportContextType {
  viewportWidth: number;
  viewportHeight: number;
}

const defaultViewport = {
  viewportWidth: 0,
  viewportHeight: 0,
};

const ViewportContext = createContext<ViewportContextType>(defaultViewport);

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewport, setViewport] = useState<ViewportContextType>(() => {
    if (typeof window !== "undefined") {
      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    }
    return defaultViewport;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setViewport({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
};

// Custom hook to use the viewport context
export const useViewport = () => {
  const context = useContext(ViewportContext);
  if (context === undefined) {
    throw new Error("useViewport must be used within a ViewportProvider");
  }
  return context;
};
