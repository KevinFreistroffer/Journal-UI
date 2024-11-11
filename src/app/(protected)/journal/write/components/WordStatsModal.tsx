import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WordStatsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  totalWords: number;
  averageWords: number;
}

export default function WordStatsModal({
  isOpen,
  onOpenChange,
  totalWords,
  averageWords,
}: WordStatsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="dark:bg-white dark:bg-opacity-50" />
      <DialogContent className="sm:max-w-[425px] w-[95vw] mx-auto bg-white dark:bg-black dark:border-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle>Word Stats</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium text-sm">Total Words</span>
            <span>{totalWords}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-medium text-sm">
              Average Words Per Journal
            </span>
            <span>{averageWords}</span>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-14 mt-4 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-700 p-1 inline-flex items-center justify-center"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
