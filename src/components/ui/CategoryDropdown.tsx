import React, { useState, useRef, useEffect } from "react";
import { ICategory } from "@/lib/interfaces";

interface CategoryDropdownProps {
  trigger: React.ReactNode;
  categories: ICategory[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  onCreateCategory: (categoryName: string) => void;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  trigger,
  categories,
  selectedCategories,
  onCategoriesChange,
  onCreateCategory,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number>(250);

  useEffect(() => {
    if (triggerRef.current) {
      setDropdownWidth(Math.max(triggerRef.current.offsetWidth, 250));
    }
  }, []);

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

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <div ref={triggerRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {trigger}
      </div>

      {isDropdownOpen && (
        <div
          className="absolute z-10 mt-1 right-0 border rounded-md bg-white dark:bg-[var(--color-darker4)] border-gray-400 dark:border-[var(--dark-menu-border)]"
          style={{ width: `${dropdownWidth}px` }}
        >
          <div className="max-h-40 overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center cursor-pointer p-2 py-3 hover:bg-gray-50 dark:hover:bg-[var(--color-darker1)] text-sm"
                onClick={() => {
                  if (selectedCategories.includes(cat.category)) {
                    onCategoriesChange(
                      selectedCategories.filter((c) => c !== cat.category)
                    );
                  } else {
                    onCategoriesChange([...selectedCategories, cat.category]);
                  }
                }}
              >
                <input
                  type="checkbox"
                  id={`category-${cat.category}`}
                  checked={selectedCategories.includes(cat.category)}
                  onChange={() => {}}
                  className="w-4 h-4 text-blue-500 border-gray-300 dark:border-[var(--dark-menu-border)] focus:ring-blue-500"
                />
                <label
                  htmlFor={`category-${cat.category}`}
                  className="ml-2 text-sm text-gray-600 dark:text-white cursor-pointer"
                >
                  {cat.category}
                </label>
              </div>
            ))}
          </div>

          <div
            onClick={() => {
              // setIsDropdownOpen(false);
              onCreateCategory("");
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
  );
};
