"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { localStorageService } from "@/lib/services/localStorageService";
import styles from "./styles.module.css";
import { Checkbox } from "@/components/ui/Checkbox";
// New LegendItem component
export function LegendItem({
  id,
  label,
  checked,
  onChange,
  checkboxSize,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  checkboxSize: number;
}) {
  return (
    <label htmlFor={id} className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="form-checkbox h-4 w-4 text-blue-600"
        size={checkboxSize}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

interface LegendProps {
  isMobile: boolean;
  isMobileLegendOpen: boolean;
  setIsMobileLegendOpen: (isOpen: boolean) => void;
  showTotalJournalsCard: boolean;
  setShowTotalJournalsCard: (show: boolean) => void;
  showCategoryBreakdownCard: boolean;
  setShowCategoryBreakdownCard: (show: boolean) => void;
  showRecentEntriesCard: boolean;
  setShowRecentEntriesCard: (show: boolean) => void;
  showUpcomingEntriesCard: boolean;
  setShowUpcomingEntriesCard: (show: boolean) => void;
  showFavoriteJournalsCard: boolean;
  setShowFavoriteJournalsCard: (show: boolean) => void;
  showKeywordFrequencyCard: boolean;
  setShowKeywordFrequencyCard: (show: boolean) => void;
  showJournalTimeCard: boolean;
  setShowJournalTimeCard: (show: boolean) => void;
  checkboxSize: number;
}

const Legend: React.FC<LegendProps> = ({
  isMobile,
  isMobileLegendOpen,
  setIsMobileLegendOpen,
  showTotalJournalsCard,
  setShowTotalJournalsCard,
  showCategoryBreakdownCard,
  setShowCategoryBreakdownCard,
  showRecentEntriesCard,
  setShowRecentEntriesCard,
  showUpcomingEntriesCard,
  setShowUpcomingEntriesCard,
  showFavoriteJournalsCard,
  setShowFavoriteJournalsCard,
  showKeywordFrequencyCard,
  setShowKeywordFrequencyCard,
  showJournalTimeCard,
  setShowJournalTimeCard,
  checkboxSize,
}) => {
  return isMobile ? (
    <div className="relative mb-4 md:mb-0">
      <button
        onClick={() => setIsMobileLegendOpen(!isMobileLegendOpen)}
        className="flex items-center justify-between w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
      >
        <span>Toggle Dashboard Cards</span>
        {isMobileLegendOpen ? (
          <ChevronUp size={20} />
        ) : (
          <ChevronDown size={20} />
        )}
      </button>
      {isMobileLegendOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg">
          <div className="p-4">
            {/* <h2
              id={`${styles["h2"]}`}
              className="text-xl font-semibold mb-2 overflow"
            >
              Toggle Metrics
            </h2> */}
            <div className="flex flex-col space-y-2">
              <LegendItem
                id="totalJournalsCard"
                label="Total Journals"
                checked={showTotalJournalsCard}
                onChange={() => {
                  const newValue = !showTotalJournalsCard;
                  setShowTotalJournalsCard(newValue);
                  localStorageService.setItem(
                    "showTotalJournalsCard",
                    newValue
                  );
                }}
                checkboxSize={checkboxSize}
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
                checkboxSize={checkboxSize}
              />
              <LegendItem
                id="recentEntriesCard"
                label="Recent Journals"
                checked={showRecentEntriesCard}
                onChange={() => {
                  const newValue = !showRecentEntriesCard;
                  setShowRecentEntriesCard(newValue);
                  localStorageService.setItem(
                    "showRecentEntriesCard",
                    newValue
                  );
                }}
                checkboxSize={checkboxSize}
              />
              <LegendItem
                id="upcomingEntriesCard"
                label="Upcoming Journals"
                checked={showUpcomingEntriesCard}
                onChange={() => {
                  const newValue = !showUpcomingEntriesCard;
                  setShowUpcomingEntriesCard(newValue);
                  localStorageService.setItem(
                    "showUpcomingEntriesCard",
                    newValue
                  );
                }}
                checkboxSize={checkboxSize}
              />
              <LegendItem
                id="favoriteJournalsCard"
                label="Favorite Journals"
                checked={showFavoriteJournalsCard}
                onChange={() => {
                  const newValue = !showFavoriteJournalsCard;
                  setShowFavoriteJournalsCard(newValue);
                  localStorageService.setItem(
                    "showFavoriteJournalsCard",
                    newValue
                  );
                }}
                checkboxSize={checkboxSize}
              />
              <LegendItem
                id="keywordFrequencyCard"
                label="Keyword Frequency"
                checked={showKeywordFrequencyCard}
                onChange={() => {
                  const newValue = !showKeywordFrequencyCard;
                  setShowKeywordFrequencyCard(newValue);
                  localStorageService.setItem(
                    "showKeywordFrequencyCard",
                    newValue
                  );
                }}
                checkboxSize={checkboxSize}
              />
              <LegendItem
                id="journalTimeCard"
                label="Journal Time"
                checked={showJournalTimeCard}
                onChange={() => {
                  const newValue = !showJournalTimeCard;
                  setShowJournalTimeCard(newValue);
                  localStorageService.setItem("showJournalTimeCard", newValue);
                }}
                checkboxSize={checkboxSize}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <>
      {/* <h2 className="text-xl font-semibold mb-2">Toggle Cards</h2> */}
      <div className="flex flex-wrap">
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="totalJournalsCard"
            className="flex items-center text-sm"
          >
            <Checkbox
              id="totalJournalsCard"
              checked={showTotalJournalsCard}
              onCheckedChange={() => {
                const newValue = !showTotalJournalsCard;
                setShowTotalJournalsCard(newValue);
                localStorageService.setItem("showTotalJournalsCard", newValue);
              }}
              className="mr-2 form-checkbox text-blue-600"
              size={checkboxSize}
            />
            Total Journals
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="categoryBreakdownCard"
            className="flex items-center text-sm"
          >
            <Checkbox
              id="categoryBreakdownCard"
              checked={showCategoryBreakdownCard}
              onCheckedChange={() => {
                const newValue = !showCategoryBreakdownCard;
                setShowCategoryBreakdownCard(newValue);
                localStorageService.setItem(
                  "showCategoryBreakdownCard",
                  newValue
                );
              }}
              className="mr-2 form-checkbox text-blue-600"
              size={checkboxSize}
            />
            Category Breakdown
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="recentEntriesCard"
            className="flex items-center text-sm"
          >
            <Checkbox
              id="recentEntriesCard"
              checked={showRecentEntriesCard}
              onCheckedChange={() => {
                const newValue = !showRecentEntriesCard;
                setShowRecentEntriesCard(newValue);
                localStorageService.setItem("showRecentEntriesCard", newValue);
              }}
              size={checkboxSize}
              className="mr-2 form-checkbox text-blue-600"
            />
            Recent Journals
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="upcomingEntriesCard"
            className="flex items-center text-sm"
          >
            <Checkbox
              id="upcomingEntriesCard"
              checked={showUpcomingEntriesCard}
              onCheckedChange={() => {
                const newValue = !showUpcomingEntriesCard;
                setShowUpcomingEntriesCard(newValue);
                localStorageService.setItem(
                  "showUpcomingEntriesCard",
                  newValue
                );
              }}
              className="mr-2 form-checkbox text-blue-600"
              size={checkboxSize}
            />
            Upcoming Journals
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="favoriteJournalsCard"
            className="flex items-center text-sm"
          >
            <Checkbox
              id="favoriteJournalsCard"
              checked={showFavoriteJournalsCard}
              onCheckedChange={() => {
                const newValue = !showFavoriteJournalsCard;
                setShowFavoriteJournalsCard(newValue);
                localStorageService.setItem(
                  "showFavoriteJournalsCard",
                  newValue
                );
              }}
              className="mr-2 form-checkbox text-blue-600"
              size={checkboxSize}
            />
            Favorite Journals
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="keywordFrequencyCard"
            className="flex items-center text-sm"
          >
            <Checkbox
              id="keywordFrequencyCard"
              checked={showKeywordFrequencyCard}
              onCheckedChange={() => {
                const newValue = !showKeywordFrequencyCard;
                setShowKeywordFrequencyCard(newValue);
                localStorageService.setItem(
                  "showKeywordFrequencyCard",
                  newValue
                );
              }}
              className="mr-2 form-checkbox text-blue-600"
              size={checkboxSize}
            />
            Keyword Frequency
          </label>
        </div>
        <div className="mr-4 mb-2 w-full">
          <label
            htmlFor="journalTimeCard"
            className="flex items-center text-sm"
          >
            <Checkbox
              id="journalTimeCard"
              checked={showJournalTimeCard}
              onCheckedChange={(checked) => {
                const newValue = !showJournalTimeCard;
                setShowJournalTimeCard(newValue as boolean);
                localStorageService.setItem("showJournalTimeCard", newValue);
              }}
              className="mr-2 form-checkbox text-blue-600"
              size={checkboxSize}
            />
            Journal Time
          </label>
        </div>
      </div>
    </>
  );
};

export default Legend;
