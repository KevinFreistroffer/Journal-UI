import { Settings, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip/tooltip";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showLastSaved: boolean;
  onShowLastSavedChange: (checked: boolean) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
  showLastSaved,
  onShowLastSavedChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <button
        onClick={() => onOpenChange(true)}
        className="p-1.5 hover:bg-gray-100 rounded-md dark:hover:bg-gray-800 transition-colors duration-200  dark:text-gray-100 dark:hover:bg-gray-700"
      >
        <Settings className="w-5 h-5 text-gray-500 dark:text-white dark:hover:bg-gray-800" />
      </button>
      <DialogOverlay className="bg-white/80 backdrop-blur-sm dark:bg-white/20" />
      <DialogContent className="w-[85%] max-w-[400px] mx-auto rounded-lg sm:rounded-lg dark:bg-black dark:border-gray-800 ">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="show-last-saved"
              className="text-sm text-gray-700 dark:text-white"
            >
              Show last saved status
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="max-w-[250px] dark:bg-gray-800 dark:border-gray-700"
                >
                  <p className="dark:text-white">
                    When enabled, this will show the auto-save status and last
                    saved time.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            id="show-last-saved"
            checked={showLastSaved}
            onCheckedChange={(checked) => {
              onShowLastSavedChange(checked);
              localStorage.setItem("showLastSaved", JSON.stringify(checked));
            }}
            className="dark:bg-white"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
