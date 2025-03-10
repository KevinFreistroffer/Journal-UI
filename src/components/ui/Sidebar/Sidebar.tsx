import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Loader2 } from "lucide-react";

interface SidebarSection {
  title: string;
  content: React.ReactNode;
}

interface IProps {
  isOpen: boolean;
  isAlwaysOpen?: boolean;
  icon?: React.ReactNode;
  sections: SidebarSection[];
  setIsSidebarOpen: (isOpen: boolean) => void;
  headerDisplaysTabs?: boolean;
  width?: "default" | "wide";
  theme: "light" | "dark";
}

export const Sidebar: React.FC<IProps> = ({
  icon,
  isOpen,
  isAlwaysOpen = false,
  sections,
  setIsSidebarOpen,
  headerDisplaysTabs = true,
  width = "default",
  theme,
}) => {
  const [isSmallViewport, setIsSmallViewport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showChevron, setShowChevron] = useState(isOpen);

  useEffect(() => {
    const checkViewport = () => {
      setIsSmallViewport(window.innerWidth <= 640); // sm breakpoint
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setShowChevron(true);
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(loadingTimer);
    } else {
      const chevronTimer = setTimeout(() => {
        setShowChevron(false);
      }, 100);
      return () => clearTimeout(chevronTimer);
    }
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed ${
          headerDisplaysTabs ? "mt-[97px]" : "mt-[57px]"
        } top-0 left-0 h-full bg-gray-100 dark:bg-[var(--color-darker2)] p-4 overflow-y-auto transition-[width] duration-300 ease-in-out z-30 ${
          theme === "light" ? "border-r border-gray-300" : ""
        } ${
          isOpen || isAlwaysOpen ? (width === "wide" ? "w-96" : "w-56") : "w-16"
        }`}
      >
        {icon && (
          <Button
            className={`border border-[#d9d9d9] dark:border-gray-800 p-1 block relative w-auto h-auto ${
              isOpen ? "justify-end ml-auto" : "justify-center"
            }`}
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsSidebarOpen(!isOpen);
            }}
            title={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            <div className="relative">
              {showChevron ? (
                <div className="transition-opacity duration-200">
                  <ChevronLeft size={20} />
                </div>
              ) : (
                <div className="transition-opacity duration-200">{icon}</div>
              )}
            </div>
          </Button>
        )}
        {isOpen && (
          <div
            className={`flex flex-col transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
          >
            {isLoading ? (
              // Placeholder loading state
              <>
                {/* <div className="mb-8 animate-pulse w-full">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>{" "}
                <div className="mb-8 animate-pulse w-full">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>{" "}
                <div className="mb-8 animate-pulse w-full">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div> */}
              </>
            ) : (
              // Actual content
              sections.map((section, index) => (
                <div
                  key={index}
                  className="mb-8 pb-2 "
                  // removed border className="mb-8 border-b border-[#e5e5e5] pb-2 dark:border-b-1"
                >
                  <p>
                    <span className="font-medium dark:text-white">
                      {section.title}
                    </span>
                  </p>
                  <div className="mt-2 text-xs md:text-sm font-normal text-gray-600 dark:text-white">
                    {section.content}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Backdrop for small viewport */}
      {isSmallViewport && isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

/**
 * <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedEntries.length ===
                      filteredAndSortedEntries?.length
                    }
                    onCheckedChange={handleSelectAll}
                    className="bg-white border-gray-300 mr-2"
                    size={4}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select All
                  </label>
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="show-favorites"
                    checked={showFavoritesOnly}
                    onCheckedChange={(checked) =>
                      setShowFavoritesOnly(checked as boolean)
                    }
                    className="bg-white border-gray-300 mr-2"
                    size={4}
                  />
                  <label
                    htmlFor="show-favorites"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Favorites Only
                  </label>
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="date-filter" className="text-sm font-medium">
                    Filter by Date
                  </label>
                  <input
                    id="date-filter"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded p-1 text-sm"
                  />
                </div>
              </div>
 */
