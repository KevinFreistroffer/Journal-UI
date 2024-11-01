"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ViewportContextType {
  viewportWidth: number;
  viewportHeight: number;
}

const ViewportContext = createContext<ViewportContextType>({
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
});

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewport, setViewport] = useState<ViewportContextType>({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  });

  useEffect(() => {
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
