import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useEffect } from "react";
import { useState } from "react";
import SaveButton from "./SaveButton";

// Add a new StorageControls component to group the autosave checkbox and save button
export default function StorageControls({
  onSave,
  autoSaveEnabled,
  onAutoSaveChange,
}: {
  onSave: () => void;
  autoSaveEnabled: boolean;
  onAutoSaveChange: (enabled: boolean) => void;
}) {
  const [hasStorage, setHasStorage] = useState<boolean>(false);

  // Check for storage availability on mount
  useEffect(() => {
    const checkStorage = () => {
      try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        // Also check sessionStorage as fallback
        sessionStorage.setItem("test", "test");
        sessionStorage.removeItem("test");
        setHasStorage(true);
      } catch {
        setHasStorage(false);
      }
    };
    checkStorage();
  }, []);

  // Don't render anything if no storage is available
  if (!hasStorage) return null;

  return (
    <div className="flex items-center gap-4">
      <SaveButton onSave={onSave} />
      <div className="flex items-center space-x-2">
        <Switch
          id="autosave"
          checked={autoSaveEnabled}
          onCheckedChange={onAutoSaveChange}
        />
        <Label
          htmlFor="autosave"
          className="text-sm text-gray-600 cursor-pointer dark:text-white"
        >
          Autosave
        </Label>
      </div>
    </div>
  );
}
