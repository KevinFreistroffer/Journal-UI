"use client";
import React from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";

type DashboardContainerProps = {
  children: React.ReactNode;
  className?: string;
  bottomBar?: React.ReactNode;
  showLoadingIndicator?: boolean;
} & (
  | {
      sidebar: React.ReactNode;
      isSidebarOpen: boolean;
    }
  | {
      sidebar?: undefined;
      isSidebarOpen?: boolean;
    }
);

const DashboardContainer = ({
  children,
  sidebar,
  className = "",
  isSidebarOpen = true,
  bottomBar,
  showLoadingIndicator = true,
}: DashboardContainerProps) => {
  const isMobileView = useMediaQuery("(max-width: 639px)");
  const isExtraSmallScreen = useMediaQuery("(max-width: 360px)");
  const { isLoading } = useAuth();

  if (isLoading && showLoadingIndicator) {
    return (
      <div className="p-6 w-full h-full min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      id="dashboard-container"
      className={`p-3 sm:p-4 md:p-6 lg:p-8 min-h-screen bg-white dark:bg-[var(--color-darker1)]`}
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
