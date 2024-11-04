import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { MonitorIcon, MaximizeIcon, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  isFullscreen: boolean;
  contentWidth: "default" | "full";
  onToggle: (value: string) => void;
}

export function ViewToggle({
  isFullscreen,
  contentWidth,
  onToggle,
}: ViewToggleProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={isFullscreen ? "fullscreen" : contentWidth}
      onValueChange={onToggle}
      className="flex items-center bg-gray-100 rounded-md p-1"
    >
      <ToggleGroup.Item
        value="default"
        aria-label="Default Width"
        className={cn(
          "p-1.5 rounded-md transition-colors",
          !isFullscreen && contentWidth === "default"
            ? "bg-white shadow-sm"
            : "hover:bg-gray-200"
        )}
      >
        <MonitorIcon className="w-4 h-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="full"
        aria-label="Full Width"
        className={cn(
          "p-1.5 rounded-md transition-colors",
          !isFullscreen && contentWidth === "full"
            ? "bg-white shadow-sm"
            : "hover:bg-gray-200"
        )}
      >
        <MaximizeIcon className="w-4 h-4" />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="fullscreen"
        aria-label="Fullscreen Mode"
        className={cn(
          "p-1.5 rounded-md transition-colors",
          isFullscreen ? "bg-white shadow-sm" : "hover:bg-gray-200"
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
