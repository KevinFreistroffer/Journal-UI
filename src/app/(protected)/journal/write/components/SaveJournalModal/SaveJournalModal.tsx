import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ICategory } from "@/lib/interfaces";
import "./SaveJournalModal.css";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { CategoryDropdown } from "@/components/ui/CategoryDropdown";

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
  onTitleChange?: (value: string) => void;
  journal: string;
  saveStatus: "idle" | "loading" | "success" | "error";
  setSaveStatus: (status: "idle" | "loading" | "success" | "error") => void;
  saveError: string | null;
  setSaveError: (error: string | null) => void;
  userId: string;
  onClose: () => void;
  handleCreateCategory: (categoryName: string) => Promise<void>;
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
  onTitleChange,
  journal,
  saveStatus,
  setSaveStatus,
  saveError,
  setSaveError,
  userId,
  onClose,
  handleCreateCategory,
}: SaveJournalModalProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await handleCreateCategory(newCategoryName);
      setNewCategoryName("");
      setIsCreateCategoryOpen(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, current saveStatus:", saveStatus);

    // Set loading state immediately
    setSaveStatus("loading");
    setSaveError(null);

    // Create FormData with current values
    const formData = new FormData();
    formData.append("title", title);
    formData.append("entry", journal);
    formData.append("categories", selectedCategories.join(","));
    formData.append("favorite", favorite.toString());
    formData.append("userId", userId);

    try {
      // Call onSubmit with the formData
      await onSubmit(formData);
      setSaveStatus("success");
    } catch (error) {
      console.error("Error submitting journal:", error);
      setSaveStatus("error");
      setSaveError(
        error instanceof Error ? error.message : "Failed to save journal"
      );
    }
  };

  useEffect(() => {
    console.log("SaveStatus changed:", saveStatus);
  }, [saveStatus]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogOverlay className="bg-white/10 backdrop-blur-sm dark:bg-white/20" />
        <DialogContent className="sm:max-w-[475px] px-10 pb-6 bg-white dark:bg-[var(--color-darker1)]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
              Optional Settings & Save
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            {/* Title Input */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => onTitleChange?.(e.target.value)}
                placeholder="My Title..."
                className="w-full"
              />
            </div>

            {/* Category Selection */}
            <CategoryDropdown
              // label={<Label>Categorize</Label>}
              trigger={
                <div className="flex items-center justify-between cursor-pointer p-2 py-3 border rounded-md bg-white dark:bg-[var(--color-darker3)] border-gray-400 dark:border-[var(--dark-menu-border)] text-sm">
                  <Label className="text-sm text-gray-600 dark:text-gray-400">
                    ({selectedCategories.length} categories selected)
                  </Label>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              }
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoriesChange={onCategoriesChange}
              onCreateCategory={onCreateCategory}
            />

            {/* Favorite Toggle */}
            <div className="flex flex-col mb-6 space-y-4 py-4">
              <Label className="text-xs text-gray-600 dark:text-white">
                Favorite this entry?
              </Label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="favorite-yes"
                    name="favorite"
                    value="yes"
                    checked={favorite}
                    onChange={() => onFavoriteChange(true)}
                    className="w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="favorite-yes"
                    className="ml-2 text-xs text-gray-600 dark:text-white cursor-pointer"
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="favorite-no"
                    name="favorite"
                    value="no"
                    checked={!favorite}
                    onChange={() => onFavoriteChange(false)}
                    className="w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="favorite-no"
                    className="ml-2 text-xs text-gray-600 dark:text-white cursor-pointer"
                  >
                    No
                  </label>
                </div>
              </div>

              {/* Hidden inputs */}
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="entry" value={journal} />
            </div>

            <DialogFooter className="flex justify-start pb-6">
              <Button
                type="submit"
                disabled={saveStatus === "loading"}
                className={cn(
                  "w-full text-white cursor-pointer px-6 py-1 text-xs md:text-sm border-box",
                  saveStatus === "loading"
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                )}
              >
                <div className="flex items-center justify-center">
                  {saveStatus === "loading" ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      <span>Saving...</span>
                    </>
                  ) : saveStatus === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    "Save"
                  )}
                </div>
              </Button>
            </DialogFooter>

            {/* Status messages */}
            {saveStatus === "error" && saveError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-md">
                <div className="flex items-center text-red-600 dark:text-red-400 text-xs md:text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>{saveError}</span>
                </div>
              </div>
            )}

            {saveStatus === "success" && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 rounded-md">
                <div className="flex items-center text-green-600 dark:text-green-400 text-xs md:text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Journal entry saved successfully!</span>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategorySubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isCreating || !newCategoryName.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isCreating ? (
                  <div className="flex items-center">
                    <Spinner className="mr-2 h-4 w-4" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
