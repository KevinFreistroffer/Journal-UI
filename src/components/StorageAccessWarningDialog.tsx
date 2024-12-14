import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

interface StorageAccessWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge: () => void;
}

const StorageAccessWarningDialog: React.FC<StorageAccessWarningDialogProps> = ({
  open,
  onOpenChange,
  onAcknowledge,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Storage Access Required</DialogTitle>
          <DialogDescription>
            Your browser has storage access disabled. Without this, your
            content cannot be automatically saved. You must manually publish
            your entries to save them.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 pt-4">
          <Button onClick={onAcknowledge} variant="default">
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StorageAccessWarningDialog; 