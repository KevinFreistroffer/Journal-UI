import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { MonitorIcon, MaximizeIcon, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  isFullscreen: boolean;
  contentWidth: "default" | "full";
  onToggle: (value: string) => void;
  showDefaultWidth?: boolean;
  showFullWidth?: boolean;
}

export function ViewToggle({
  isFullscreen,
  contentWidth,
  onToggle,
  showDefaultWidth = true,
  showFullWidth = true,
}: ViewToggleProps) {
  const value = isFullscreen ? "fullscreen" : contentWidth || "default";

  const handleValueChange = (newValue: string) => {
    onToggle(newValue || value);
  };

  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={handleValueChange}
      className={cn(
        "flex items-center bg-gray-100 p-1 dark:bg-transparent",
        showDefaultWidth && showFullWidth && !isFullscreen ? "rounded-md" : "rounded-lg"
      )}
    >
      {!isFullscreen && (
        <>
          {showDefaultWidth && (
            <ToggleGroup.Item
              value="default"
              aria-label="Default Width"
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                !isFullscreen && contentWidth === "default"
                  ? "bg-white shadow-sm dark:bg-transparent dark:hover:bg-transparent"
                  : "hover:bg-gray-200 dark:hover:bg-transparent"
              )}
            >
              <MonitorIcon className="w-4 h-4" />
            </ToggleGroup.Item>
          )}
          {showFullWidth && (
            <ToggleGroup.Item
              value="full"
              aria-label="Full Width"
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                !isFullscreen && contentWidth === "full"
                  ? "bg-white shadow-sm dark:bg-transparent dark:hover:bg-transparent"
                  : "hover:bg-gray-200 dark:hover:bg-transparent"
              )}
            >
              <MaximizeIcon className="w-4 h-4" />
            </ToggleGroup.Item>
          )}
        </>
      )}
      <ToggleGroup.Item
        value="fullscreen"
        aria-label="Fullscreen Mode"
        className={cn(
          "p-1.5 rounded-md transition-colors dark:text-white dark:bg-transparent cursor-pointer",
          isFullscreen
            ? "bg-white shadow-sm dark:bg-transparent dark:hover:bg-transparent"
            : "hover:bg-gray-200 dark:hover:bg-transparent"
        )}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
