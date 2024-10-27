import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  ChevronDownIcon,
  CheckIcon,
  Cross1Icon,
  PlusIcon,
} from "@radix-ui/react-icons";

interface CategoryDropdownProps {
  journalId: string;
  categories: string[];
  currentCategory: string;
  onCategoryChange: (journalId: string, category: string) => void;
  onCreateCategoryClick: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Purpose of this is to show the users categories, to select one, and to create a new one.
 */
export default function CategoryDropdown({
  journalId,
  categories,
  currentCategory,
  onCategoryChange,
  onCreateCategoryClick,
  isOpen,
  onOpenChange,
}: CategoryDropdownProps) {
  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button className="flex items-center justify-center w-8 h-8 border border-l-0 bg-gray-100 rounded-tr rounded-br focus:outline-none">
          <ChevronDownIcon className="w-4 h-4" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-md shadow-lg border border-gray-200 w-[200px] z-50"
          sideOffset={5}
          align="end"
        >
          <div className="font-bold px-4 py-3 text-sm border-b border-gray-200 flex justify-between items-center">
            Categories
            <button
              onClick={() => onOpenChange(false)}
              className="hover:bg-gray-100 p-1 rounded-sm"
            >
              <Cross1Icon className="w-3 h-3" />
            </button>
          </div>
          {categories
            .filter((cat) => cat !== "All")
            .map((category) => (
              <button
                key={category}
                className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-100 rounded-sm flex items-center justify-between ${
                  currentCategory === category ? "text-blue-500" : ""
                }`}
                onClick={() => {
                  onCategoryChange(journalId, category);
                  onOpenChange(false);
                }}
              >
                {category}
                {currentCategory === category && (
                  <CheckIcon className="w-4 h-4" />
                )}
              </button>
            ))}
          <button
            onClick={() => {
              onCreateCategoryClick();
              onOpenChange(false);
            }}
            className="w-full px-4 py-3 text-sm text-left hover:bg-gray-100 border-t border-gray-200 flex items-center text-blue-500"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create new
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
