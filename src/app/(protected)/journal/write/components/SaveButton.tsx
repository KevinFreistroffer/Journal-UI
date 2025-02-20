import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip"; // Add these imports
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";

// Create a new SubmitButton component
export default function SaveButton({ onSave }: { onSave: () => void }) {
  const handleClick = () => {
    // Only save if there's any content to save
    onSave();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClick}
            className={cn(
              "w-auto h-auto border border-solid p-1 rounded-md bg-blue-500 hover:bg-blue-600 hover:text-white text-white transition-colors duration-200",
              "dark:bg-transparent dark:text-gray-100 dark:hover:bg-transparent dark:border-gray-800"
            )}
          >
            <Save className="w-[18px] h-[18px]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[250px] shadow-lg rounded-lg text-sm p-2 border border-gray-100 dark:border-gray-700"
        >
          <p>
            Save your progress locally. This will allow you to restore your work
            if you accidentally close the page.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
