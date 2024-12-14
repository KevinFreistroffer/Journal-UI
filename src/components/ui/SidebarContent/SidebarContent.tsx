import { Checkbox } from "@/components/ui/Checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CategoryDropdown } from "@/components/ui/CategoryDropdown";

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
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: any[];
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
  selectedCategory,
  setSelectedCategory,
  categories,
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
              Favorites Only
            </label>
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="date-filter" className="text-xs font-medium">
              Created Date
            </label>
            <input
              id="date-filter"
              type="date"
              value={selectedFilterDate}
              onChange={(e) => setSelectedFilterDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded p-1 px-2 text-xs bg-transparent"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <CategoryDropdown
              categories={categories}
              selectedCategories={
                user?.journals
                  .map((journal) => journal.categories.map((c) => c.category))
                  .flat() || []
              }
              trigger={<label className="text-xs font-medium">Category</label>}
              onCategoriesChange={(selected: string[]) => {
                setSelectedCategory(selected[0] || "");
              }}
              onCreateCategory={(categoryName: string) => {
                setShowCreateCategoryModal(true);
                setNewCategoryName(categoryName);
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Sort By",
      content: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-start">
            <Checkbox
              id="sort-last-updated"
              checked={showUpdatedDate}
              onCheckedChange={(checked) =>
                setShowUpdatedDate(checked as boolean)
              }
              className="bg-white border-gray-300 mr-2"
              size={4}
            />{" "}
            <label
              htmlFor="sort-last-updated"
              className="text-xs font-medium leading-none"
            >
              Last Updated
            </label>
          </div>
          <div className="flex items-center justify-start">
            <Checkbox
              id="sort-name"
              checked={showUpdatedDate}
              onCheckedChange={(checked) =>
                setShowUpdatedDate(checked as boolean)
              }
              className="bg-white border-gray-300 mr-2"
              size={4}
            />{" "}
            <label
              htmlFor="sort-name"
              className="text-xs font-medium leading-none"
            >
              Name
            </label>
          </div>
          <div className="flex items-center justify-start">
            <Checkbox
              id="sort-favorited"
              checked={showUpdatedDate}
              onCheckedChange={(checked) =>
                setShowUpdatedDate(checked as boolean)
              }
              className="bg-white border-gray-300 mr-2"
              size={4}
            />{" "}
            <label
              htmlFor="sort-favorited"
              className="text-xs font-medium leading-none"
            >
              Favorited
            </label>
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
