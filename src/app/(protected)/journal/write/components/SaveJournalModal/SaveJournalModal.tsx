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
} from "@/components/ui/dialog";
import { ICategory } from "@/lib/interfaces";
import "./SaveJournalModal.css";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";

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
  journal,
  saveStatus,
  saveError,
  userId,
  onClose,
  handleCreateCategory,
}: SaveJournalModalProps) {
  console.log(categories);
  console.log(selectedCategories);

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogOverlay className="bg-white/10 backdrop-blur-sm dark:bg-white/20" />
        <DialogContent className="sm:max-w-[475px] px-8 bg-white dark:bg-black">
          <DialogHeader>
            <DialogTitle className="text-gray-600 dark:text-white">
              Save
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
              <div className="space-y-2 mb-2 relative" ref={dropdownRef}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between cursor-pointer p-2 border rounded-md dark:border-[var(--dark-menu-border)]"
                >
                  <Label className="text-xs text-gray-600 dark:text-[var(--dark-menu-text)]">
                    Categorize ({selectedCategories.length} selected)
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

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full left-0 right-0 border rounded-md bg-white dark:bg-[var(--dark-menu-bg)] dark:border-[var(--dark-menu-border)]">
                    <div className="max-h-40 overflow-y-auto p-2">
                      {categories.map((cat) => (
                        <div
                          key={cat.category}
                          className="flex items-center cursor-pointer py-1 hover:bg-gray-50 dark:hover:bg-[var(--dark-menu-hover)]"
                        >
                          <input
                            type="checkbox"
                            id={`category-${cat.category}`}
                            checked={selectedCategories.includes(cat.category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onCategoriesChange([
                                  ...selectedCategories,
                                  cat.category,
                                ]);
                              } else {
                                onCategoriesChange(
                                  selectedCategories.filter(
                                    (c) => c !== cat.category
                                  )
                                );
                              }
                            }}
                            className="w-4 h-4 text-blue-500 border-gray-300 dark:border-[var(--dark-menu-border)] focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`category-${cat.category}`}
                            className="ml-2 text-xs text-gray-600 dark:text-[var(--dark-menu-text)] cursor-pointer"
                          >
                            {cat.category}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div
                      onClick={() => {
                        setIsCreateCategoryOpen(true);
                        setIsDropdownOpen(false);
                        onCreateCategory(newCategoryName);
                      }}
                      className="flex items-center cursor-pointer py-2 px-2 border-t hover:bg-gray-50 dark:hover:bg-[var(--dark-menu-hover)] dark:border-[var(--dark-menu-border)]"
                    >
                      <span className="ml-2 text-xs cursor-pointer text-blue-500 dark:text-blue-400">
                        + Create new
                      </span>
                    </div>
                  </div>
                )}
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
