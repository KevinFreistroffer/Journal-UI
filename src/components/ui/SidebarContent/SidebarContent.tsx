import { Checkbox } from "@/components/ui/Checkbox";

interface SidebarContentProps {
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (value: boolean) => void;
  selectedFilterDate: string;
  setSelectedFilterDate: (value: string) => void;
  showSentiment: boolean;
  setShowSentiment: (value: boolean) => void;
  showCategory: boolean;
  setShowCategory: (value: boolean) => void;
  showUpdatedDate: boolean;
  setShowUpdatedDate: (value: boolean) => void;
  journalCount?: number;
  favoritedJournalCount?: number;
}

export default function SidebarContent({
  showFavoritesOnly,
  setShowFavoritesOnly,
  selectedFilterDate,
  setSelectedFilterDate,
  showSentiment,
  setShowSentiment,
  showCategory,
  setShowCategory,
  showUpdatedDate,
  setShowUpdatedDate,
  journalCount,
  favoritedJournalCount,
}: SidebarContentProps) {
  return [
    {
      title: "Filters",
      content: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-start">
            <Checkbox
              id="show-favorites"
              checked={showFavoritesOnly}
              onCheckedChange={(checked) =>
                setShowFavoritesOnly(checked as boolean)
              }
              className="bg-white border-gray-300 mr-2"
              size={4}
            />{" "}
            <label
              htmlFor="show-favorites"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Favorites Only
            </label>
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="date-filter" className="text-xs font-medium">
              Filter by Created Date
            </label>
            <input
              id="date-filter"
              type="date"
              value={selectedFilterDate}
              onChange={(e) => setSelectedFilterDate(e.target.value)}
              className="border rounded p-1 text-xs"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Settings",
      content: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-start">
            <Checkbox
              id="show-sentiment"
              checked={showSentiment}
              onCheckedChange={(checked) =>
                setShowSentiment(checked as boolean)
              }
              className="bg-white border-gray-300 mr-2"
              size={4}
            />{" "}
            <label
              htmlFor="show-sentiment"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Sentiment
            </label>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-start">
              <Checkbox
                id="show-category"
                checked={showCategory}
                onCheckedChange={(checked) =>
                  setShowCategory(checked as boolean)
                }
                className="bg-white border-gray-300 mr-2"
                size={4}
              />{" "}
              <label
                htmlFor="show-category"
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show Category
              </label>
            </div>
            <div className="flex items-center justify-start">
              <Checkbox
                id="show-updated-date"
                checked={showUpdatedDate}
                onCheckedChange={(checked) =>
                  setShowUpdatedDate(checked as boolean)
                }
                className="bg-white border-gray-300 mr-2"
                size={4}
              />{" "}
              <label
                htmlFor="show-updated-date"
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show Updated Date
              </label>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Data",
      content: (
        <div className="flex flex-col space-y-2">
          <p className="text-xs font-medium">
            Total Journal Entries: {journalCount || 0}
          </p>
          <p className="text-xs font-medium">
            Total Favorited Journals: {favoritedJournalCount || 0}
          </p>
        </div>
      ),
    },
  ];
}
