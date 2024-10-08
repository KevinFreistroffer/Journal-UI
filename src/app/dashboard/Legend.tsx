"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { localStorageService } from "@/lib/services/localStorageService";

const Legend = ({
  isMobile,
  isLegendOpen,
  setIsLegendOpen,
  showTotalEntrysCard,
  setShowTotalEntrysCard,
  showCategoryBreakdownCard,
  setShowCategoryBreakdownCard,
  showRecentEntriesCard,
  setShowRecentEntriesCard,
  showUpcomingEntriesCard,
  setShowUpcomingEntriesCard,
  showFavoriteEntrysCard,
  setShowFavoriteEntrysCard,
}: {
  isMobile: boolean;
  isLegendOpen: boolean;
  setIsLegendOpen: (isLegendOpen: boolean) => void;
  showTotalEntrysCard: boolean;
  setShowTotalEntrysCard: (showTotalEntrysCard: boolean) => void;
  showCategoryBreakdownCard: boolean;
  setShowCategoryBreakdownCard: (showCategoryBreakdownCard: boolean) => void;
  showRecentEntriesCard: boolean;
  setShowRecentEntriesCard: (showRecentEntriesCard: boolean) => void;
  showUpcomingEntriesCard: boolean;
  setShowUpcomingEntriesCard: (showUpcomingEntriesCard: boolean) => void;
  showFavoriteEntrysCard: boolean;
  setShowFavoriteEntrysCard: (showFavoriteEntrysCard: boolean) => void;
}) => {
  return isMobile ? (
    <div className="relative mb-4 md:mb-0">
      <button
        onClick={() => setIsLegendOpen(!isLegendOpen)}
        className="flex items-center justify-between w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
      >
        <span>Toggle Dashboard Cards</span>
        {isLegendOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isLegendOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Toggle Metrics</h2>
            <div className="flex flex-col space-y-2">
              <LegendItem
                id="totalEntrysCard"
                label="Total Entries"
                checked={showTotalEntrysCard}
                onChange={() => {
                  const newValue = !showTotalEntrysCard;
                  setShowTotalEntrysCard(newValue);
                  localStorageService.setItem("showTotalEntrysCard", newValue);
                }}
              />
              <LegendItem
                id="categoryBreakdownCard"
                label="Category Breakdown"
                checked={showCategoryBreakdownCard}
                onChange={() => {
                  const newValue = !showCategoryBreakdownCard;
                  setShowCategoryBreakdownCard(newValue);
                  localStorageService.setItem(
                    "showCategoryBreakdownCard",
                    newValue
                  );
                }}
              />
              <LegendItem
                id="recentEntriesCard"
                label="Recent Entries"
                checked={showRecentEntriesCard}
                onChange={() => {
                  const newValue = !showRecentEntriesCard;
                  setShowRecentEntriesCard(newValue);
                  localStorageService.setItem(
                    "showRecentEntriesCard",
                    newValue
                  );
                }}
              />
              <LegendItem
                id="upcomingEntriesCard"
                label="Upcoming Entries"
                checked={showUpcomingEntriesCard}
                onChange={() => {
                  const newValue = !showUpcomingEntriesCard;
                  setShowUpcomingEntriesCard(newValue);
                  localStorageService.setItem(
                    "showUpcomingEntriesCard",
                    newValue
                  );
                }}
              />
              <LegendItem
                id="favoriteEntrysCard"
                label="Favorite Entries"
                checked={showFavoriteEntrysCard}
                onChange={() => {
                  const newValue = !showFavoriteEntrysCard;
                  setShowFavoriteEntrysCard(newValue);
                  localStorageService.setItem(
                    "showFavoriteEntrysCard",
                    newValue
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <>
      <h2 className="text-xl font-semibold mb-2">Toggle Cards</h2>
      <div className="flex flex-wrap">
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="totalEntrysCard"
            className="flex items-center text-sm"
          >
            <input
              type="checkbox"
              id="totalEntrysCard"
              checked={showTotalEntrysCard}
              onChange={() => {
                const newValue = !showTotalEntrysCard;
                setShowTotalEntrysCard(newValue);
                localStorageService.setItem("showTotalEntrysCard", newValue);
              }}
              className="mr-2 form-checkbox h-3 w-3 text-blue-600"
            />
            Total Entries
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="categoryBreakdownCard"
            className="flex items-center text-sm"
          >
            <input
              type="checkbox"
              id="categoryBreakdownCard"
              checked={showCategoryBreakdownCard}
              onChange={() => {
                const newValue = !showCategoryBreakdownCard;
                setShowCategoryBreakdownCard(newValue);
                localStorageService.setItem(
                  "showCategoryBreakdownCard",
                  newValue
                );
              }}
              className="mr-2 form-checkbox h-3 w-3 text-blue-600"
            />
            Category Breakdown
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="recentEntriesCard"
            className="flex items-center text-sm"
          >
            <input
              type="checkbox"
              id="recentEntriesCard"
              checked={showRecentEntriesCard}
              onChange={() => {
                const newValue = !showRecentEntriesCard;
                setShowRecentEntriesCard(newValue);
                localStorageService.setItem("showRecentEntriesCard", newValue);
              }}
              className="mr-2 form-checkbox h-3 w-3 text-blue-600"
            />
            Recent Entries
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="upcomingEntriesCard"
            className="flex items-center text-sm"
          >
            <input
              type="checkbox"
              id="upcomingEntriesCard"
              checked={showUpcomingEntriesCard}
              onChange={() => {
                const newValue = !showUpcomingEntriesCard;
                setShowUpcomingEntriesCard(newValue);
                localStorageService.setItem(
                  "showUpcomingEntriesCard",
                  newValue
                );
              }}
              className="mr-2 form-checkbox h-3 w-3 text-blue-600"
            />
            Upcoming Entries
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="favoriteEntrysCard"
            className="flex items-center text-sm"
          >
            <input
              type="checkbox"
              id="favoriteEntrysCard"
              checked={showFavoriteEntrysCard}
              onChange={() => {
                const newValue = !showFavoriteEntrysCard;
                setShowFavoriteEntrysCard(newValue);
                localStorageService.setItem("showFavoriteEntrysCard", newValue);
              }}
              className="mr-2 form-checkbox h-3 w-3 text-blue-600"
            />
            Favorite Entries
          </label>
        </div>
      </div>
    </>
  );
};

// New LegendItem component
function LegendItem({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-4 w-4 text-blue-600"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export default Legend;
