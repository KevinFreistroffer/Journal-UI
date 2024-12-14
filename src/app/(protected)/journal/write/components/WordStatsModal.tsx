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
      <DialogOverlay className="dark:bg-neutral-900/50" />
      <DialogContent className="bg-white dark:bg-[var(--color-darker4)]">
        <DialogHeader>
          <DialogTitle className="text-lg">Word Stats</DialogTitle>
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
            className="text-xs w-full p-1"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
