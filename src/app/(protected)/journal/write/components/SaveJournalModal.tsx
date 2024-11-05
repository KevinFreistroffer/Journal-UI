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
  DialogTitle,
} from "@/components/ui/dialog";
import { ICategory } from "@/lib/interfaces";
import styles from "./SaveJournalModal.module.css";

interface SaveJournalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
  categories: ICategory[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
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
      <DialogContent className="sm:max-w-[475px] px-8">
        <DialogHeader>
          <DialogTitle>Optional Settings</DialogTitle>
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
              <Label htmlFor="favorite" className="cursor-pointer">
                Favorite this entry?
              </Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="favorite-no"
                    name="favorite"
                    value="false"
                    checked={!favorite}
                    onChange={() => onFavoriteChange(false)}
                    className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="favorite-no"
                    className="ml-2 text-sm text-gray-600"
                  >
                    No
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="favorite-yes"
                    name="favorite"
                    value="true"
                    checked={favorite}
                    onChange={() => onFavoriteChange(true)}
                    className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="favorite-yes"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Yes
                  </label>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2 mb-2">
              <Label htmlFor="category" className="text-sm">
                Categorize
              </Label>
              <MultiSelect
                options={categories.map((cat) => ({
                  value: cat.category,
                  label: cat.category,
                }))}
                selectedValues={selectedCategories}
                onChange={onCategoriesChange}
                placeholder="Select categories..."
                className="overflow-wrap-anywhere text-sm"
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
                className={`relative bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-6 py-1`}
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
                className={`bg-gray-100 hover:bg-gray-200 cursor-pointer px-6 py-1 `}
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>

          {/* Error message display */}
          {saveStatus === "error" && saveError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">{saveError}</span>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
