import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  journal: string;
}

export default function PreviewModal({
  isOpen,
  onOpenChange,
  title,
  journal,
}: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="dark:bg-white dark:bg-opacity-50" />
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[80vh] overflow-y-auto dark:bg-black dark:border-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {title || "Untitled Journal"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 px-4">
          <div
            className="preview-content ql-editor"
            dangerouslySetInnerHTML={{
              __html: journal,
            }}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-4"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
