import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Tooltip from "@radix-ui/react-tooltip";
import { MonitorIcon, MaximizeIcon, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  isFullscreen: boolean;
  contentWidth: "default" | "full";
  showDefaultWidth: boolean;
  showFullWidth: boolean;
  onToggle: (value: "default" | "full" | "fullscreen") => void;
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
    console.log("newValue", newValue, typeof newValue);
    const valueToUse = (!newValue && isFullscreen) ? "fullscreen" : newValue;
    if (!valueToUse) return;
    onToggle(valueToUse as "default" | "full" | "fullscreen");
  };

  return (
    <Tooltip.Provider delayDuration={0}>
      <ToggleGroup.Root
        type="single"
        value={value}
        onValueChange={handleValueChange}
        className={cn(
          "flex items-center bg-gray-100 p-1 dark:bg-transparent",
          showDefaultWidth && showFullWidth && !isFullscreen
            ? "rounded-md"
            : "rounded-lg"
        )}
      >
        {showDefaultWidth && (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <ToggleGroup.Item
                value="default"
                aria-label="Default Width"
                className={cn(
                  "p-1.5 rounded-md transition-colors cursor-pointer",
                  contentWidth === "default"
                    ? "bg-white shadow-sm dark:bg-transparent dark:hover:bg-transparent"
                    : "hover:bg-gray-200 dark:hover:bg-transparent"
                )}
              >
                <MonitorIcon className="w-4 h-4" />
              </ToggleGroup.Item>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white"
                sideOffset={5}
              >
                Default Width
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}
        {showFullWidth && (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <ToggleGroup.Item
                value="full"
                aria-label="Full Width"
                className={cn(
                  "p-1.5 rounded-md transition-colors cursor-pointer",
                  contentWidth === "full"
                    ? "bg-white shadow-sm dark:bg-transparent dark:hover:bg-transparent"
                    : "hover:bg-gray-200 dark:hover:bg-transparent"
                )}
              >
                <MaximizeIcon className="w-4 h-4" />
              </ToggleGroup.Item>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white"
                sideOffset={5}
              >
                Full Width
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
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
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white"
              sideOffset={5}
            >
              {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </ToggleGroup.Root>
    </Tooltip.Provider>
  );
}
