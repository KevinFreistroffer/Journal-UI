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
  return (
    <div className="flex flex-wrap">
      <div className="mr-4 mb-2 w-full">
        <LegendItem
          id="categoryBreakdownCard"
          label="Category Breakdown"
          checked={showCategoryBreakdownCard}
          onChange={() => {
            const newValue = !showCategoryBreakdownCard;
            setShowCategoryBreakdownCard(newValue);
            localStorageService.setItem("showCategoryBreakdownCard", newValue);
          }}
          checkboxSize={checkboxSize}
        />
      </div>
      <div className="mr-4 mb-2 w-full">
        <LegendItem
          id="recentEntriesCard"
          label="Recent Journals"
          checked={showRecentEntriesCard}
          onChange={() => {
            const newValue = !showRecentEntriesCard;
            setShowRecentEntriesCard(newValue);
            localStorageService.setItem("showRecentEntriesCard", newValue);
          }}
          checkboxSize={checkboxSize}
        />
      </div>
      <div className="mr-4 mb-2 w-full">
        <LegendItem
          id="upcomingEntriesCard"
          label="Upcoming Journals"
          checked={showUpcomingEntriesCard}
          onChange={() => {
            const newValue = !showUpcomingEntriesCard;
            setShowUpcomingEntriesCard(newValue);
            localStorageService.setItem("showUpcomingEntriesCard", newValue);
          }}
          checkboxSize={checkboxSize}
        />
      </div>
      <div className="mr-4 mb-2 w-full">
        <LegendItem
          id="favoriteJournalsCard"
          label="Favorite Journals"
          checked={showFavoriteJournalsCard}
          onChange={() => {
            const newValue = !showFavoriteJournalsCard;
            setShowFavoriteJournalsCard(newValue);
            localStorageService.setItem("showFavoriteJournalsCard", newValue);
          }}
          checkboxSize={checkboxSize}
        />
      </div>
      <div className="mr-4 mb-2 w-full">
        <LegendItem
          id="keywordFrequencyCard"
          label="Keyword Frequency"
          checked={showKeywordFrequencyCard}
          onChange={() => {
            const newValue = !showKeywordFrequencyCard;
            setShowKeywordFrequencyCard(newValue);
            localStorageService.setItem("showKeywordFrequencyCard", newValue);
          }}
          checkboxSize={checkboxSize}
        />
      </div>
      <div className="mr-4 mb-2 w-full">
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
  );
};

export default Legend;
