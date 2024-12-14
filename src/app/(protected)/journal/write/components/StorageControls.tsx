import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useEffect } from "react";
import { useState } from "react";
import SaveButton from "./SaveButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip";
import { HelpCircle } from "lucide-react";

export default function StorageControls({
  onSave,
  autoSaveEnabled,
  onAutoSaveChange,
  lastSavedTime,
  isAutosaving,
  showLastSaved,
}: {
  onSave: () => void;
  autoSaveEnabled: boolean;
  onAutoSaveChange: (enabled: boolean) => void;
  lastSavedTime: Date | null;
  isAutosaving: boolean;
  showLastSaved: boolean;
}) {
  const [hasStorage, setHasStorage] = useState<boolean>(false);

  useEffect(() => {
    const checkStorage = () => {
      try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        sessionStorage.setItem("test", "test");
        sessionStorage.removeItem("test");
        setHasStorage(true);
      } catch {
        setHasStorage(false);
      }
    };
    checkStorage();
  }, []);

  if (!hasStorage) return null;

  return (
    <div className="flex items-center">
      {showLastSaved && lastSavedTime && (
        <div className="text-xs text-gray-500 mr-4">
          {isAutosaving ? (
            <span>Saving...</span>
          ) : (
            <span>Last saved {lastSavedTime.toLocaleTimeString()}</span>
          )}
        </div>
      )}
      <SaveButton onSave={onSave} />
      <div className="flex items-center space-x-2 ml-2 mr-1">
        <Switch
          id="autosave"
          checked={autoSaveEnabled}
          onCheckedChange={onAutoSaveChange}
        />
        <div className="flex items-center gap-1">
          <Label
            htmlFor="autosave"
            className="text-sm text-gray-600 cursor-pointer dark:text-white"
          >
            Autosave
          </Label>
        </div>
      </div>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-[250px] shadow-lg rounded-lg text-sm p-2 border border-gray-100 dark:border-gray-700"
          >
            <p>Automatically save your journal entry every few seconds</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
