import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { MultiSelect } from "@/components/ui/MultiSelect/MutliSelect";
import { Spinner } from "@/components/ui/Spinner";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICategory } from "@/lib/interfaces";
import "./SaveJournalModal.css";

interface SaveJournalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
  categories: ICategory[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  onCreateCategory: (inputValue: string) => void;
  favorite: boolean;
  onFavoriteChange: (favorite: boolean) => void;
  title: string;
  journal: string;
  saveStatus: "idle" | "loading" | "success" | "error";
  saveError: string | null;
  onClose: () => void;
}

export default function SaveJournalModal({
  isOpen,
  onOpenChange,
  onSubmit,
  categories,
  selectedCategories,
  onCategoriesChange,
  onCreateCategory,
  favorite,
  onFavoriteChange,
  title,
  journal,
  saveStatus,
  saveError,
  onClose,
}: SaveJournalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-white/10 backdrop-blur-sm dark:bg-white/20" />
      <DialogContent className="sm:max-w-[475px] px-8 bg-white dark:bg-black">
        <DialogHeader>
          <DialogTitle className="text-gray-600 dark:text-white">
            Optional Settings
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSubmit(formData);
          }}
        >
          <div className="grid gap-4 py-4 mb-6">
            {/* Favorite Toggle */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="favorite"
                  name="favorite"
                  checked={favorite}
                  onChange={(e) => onFavoriteChange(e.target.checked)}
                  className="w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="favorite"
                  className="ml-2 text-xs  text-gray-600 dark:text-white cursor-pointer"
                >
                  Favorite this entry?
                </label>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2 mb-2">
              <Label
                htmlFor="category"
                className="text-xs text-gray-600 dark:text-white"
              >
                Categorize
              </Label>
              <MultiSelect
                options={categories.map((cat) => ({
                  value: cat.category,
                  label: cat.category,
                }))}
                selectedValues={selectedCategories}
                onChange={onCategoriesChange}
                onCreateOption={(inputValue) => {
                  console.log(inputValue);
                  onCreateCategory(inputValue);
                }}
                placeholder="Select categories..."
                className="overflow-wrap-anywhere text-xs md:text-sm
                  dark:bg-gray-900 dark:border-gray-700 dark:text-white
                  bg-white border-gray-200 text-gray-900
                  hover:border-gray-300 dark:hover:border-gray-600"
              />
            </div>

            {/* Hidden inputs */}
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="entry" value={journal} />
          </div>

          <DialogFooter className="flex justify-start">
            <div className="w-full flex xs:flex-row gap-3">
              <Button
                type="submit"
                disabled={saveStatus === "loading"}
                className="relative bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-6 py-1 dark:bg-blue-600 dark:hover:bg-blue-700 text-xs md:text-sm"
              >
                {saveStatus === "loading" ? (
                  <div className="flex items-center justify-center">
                    <Spinner className="mr-2 h-4 w-4" />
                    <span>Saving...</span>
                  </div>
                ) : saveStatus === "success" ? (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Saved!</span>
                  </div>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-gray-600 cursor-pointer px-6 py-1 text-xs md:text-sm"
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>

          {/* Error message display */}
          {saveStatus === "error" && saveError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-md">
              <div className="flex items-center text-red-600 dark:text-red-400 text-xs md:text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{saveError}</span>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
