"use client";
import React, { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type DashboardContainerProps = {
  children: React.ReactNode;
  className?: string;
  bottomBar?: React.ReactNode;
} & (
  | {
      sidebar: React.ReactNode; // When sidebar is provided
      isSidebarOpen: boolean; // isSidebarOpen must be provided
    }
  | {
      sidebar?: undefined; // When sidebar is not provided
      isSidebarOpen?: boolean; // isSidebarOpen is optional
    }
);

const DashboardContainer = ({
  children,
  sidebar,
  className = "",
  isSidebarOpen = true,
  bottomBar,
}: DashboardContainerProps) => {
  const isMobileView = useMediaQuery("(max-width: 639px)");
  const isExtraSmallScreen = useMediaQuery("(max-width: 360px)");

  return (
    <div
      id="dashboard-container"
      className={`p-3 sm:p-4 md:p-6 lg:p-8 min-h-screen bg-background dark:bg-background`}
    >
      {/* Sidebar - hidden on extra small screens */}
      {sidebar && !isExtraSmallScreen && (
        <div className="md:block fixed left-0 top-0 h-full z-30">{sidebar}</div>
      )}
      <div
        className={`flex-1 p-0 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out ${
          isExtraSmallScreen
            ? ""
            : sidebar && !isMobileView
            ? isSidebarOpen
              ? "sm:ml-56"
              : "sm:ml-16"
            : sidebar
            ? "ml-16"
            : ""
        }`}
      >
        {children}
      </div>

      {/* Bottom bar */}
      {bottomBar && (
        <div className="fixed bottom-0 left-0 right-0 z-[500]">{bottomBar}</div>
      )}
    </div>
  );
};

export default DashboardContainer;
