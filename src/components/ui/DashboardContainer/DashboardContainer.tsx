"use client";
import React, { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface DashboardContainerProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
  isSidebarOpen: boolean;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  sidebar,
  className = "",
  isSidebarOpen,
}) => {
  const isMobileView = useMediaQuery("(max-width: 639px)");
  const isExtraSmallScreen = useMediaQuery("(max-width: 360px)");

  return (
    <div className={`${isExtraSmallScreen ? 'p-2' : 'p-3 sm:p-4 md:p-6 lg:p-8'} min-h-screen`}>
      {/* Sidebar - hidden on extra small screens */}
      {!isExtraSmallScreen && (
        <div className="md:block fixed left-0 top-0 h-full z-30">
          {sidebar}
        </div>
      )}
      <div
        className={`flex-1 p-0 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out ${
          isExtraSmallScreen
            ? ''
            : (!isMobileView ? (isSidebarOpen ? "sm:ml-56" : "sm:ml-16") : "ml-16")
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default DashboardContainer;
