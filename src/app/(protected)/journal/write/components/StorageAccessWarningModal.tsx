import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface StorageAccessWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StorageAccessWarningModal({
  open,
  onOpenChange,
}: StorageAccessWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Storage Access Required
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600 mb-3">
            We&apos;ve detected that your browser has limited or no access to
            local storage capabilities. This may be due to:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 mb-3">
            <li>Private browsing mode</li>
            <li>Browser settings blocking storage access</li>
            <li>Storage being disabled</li>
          </ul>
          <p className="text-sm text-gray-600 mb-3">
            Without storage access, you may experience:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            <li>Loss of unsaved journal entries</li>
            <li>Inability to save drafts</li>
            <li>Reduced app functionality</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
