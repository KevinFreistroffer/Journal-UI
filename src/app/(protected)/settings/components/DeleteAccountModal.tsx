import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  deleteConfirmation: string;
  setDeleteConfirmation: (value: string) => void;
  handleDeleteAccount: () => void;
  isDeleting: boolean;
  showFinalConfirmation: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onOpenChange,
  deleteConfirmation,
  setDeleteConfirmation,
  handleDeleteAccount,
  isDeleting,
  showFinalConfirmation,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="dark:bg-neutral-900/50" />
      <DialogContent className="bg-white dark:bg-[var(--color-darker4)]">
        <DialogHeader>
          <DialogTitle className="text-lg text-red-500">
            Delete Account
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4 dark:text-gray-300">
          <p className="font-medium">Warning: This action cannot be undone.</p>
          <ul className="list-disc pl-4 space-y-2 text-sm">
            <li>All your data will be permanently deleted</li>
            <li>You will lose access to all your content</li>
            <li>Your username will be released</li>
          </ul>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Type &quot;I confirm deletion of my account&quot; to continue:
            </p>
            <Input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className=""
              placeholder="Type confirmation here"
            />
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={
              deleteConfirmation !== "I confirm deletion of my account" ||
              isDeleting
            }
            className="text-xs"
          >
            {isDeleting
              ? "Deleting..."
              : showFinalConfirmation
              ? "Yes, I'm absolutely sure - Delete Account"
              : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
