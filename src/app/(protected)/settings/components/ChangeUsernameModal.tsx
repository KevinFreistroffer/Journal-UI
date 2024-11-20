import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useState, useEffect } from "react";

interface IProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  username: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | null;
}

const ChangeUsernameModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  username,
  onUsernameChange,
  error,
}: IProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    await onSubmit(e);
    setIsConfirming(false);
  };

  // Reset confirmation state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsConfirming(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="dark:bg-neutral-900/50" />
      <DialogContent className="bg-white dark:bg-neutral-900">
        <DialogHeader>
          <DialogTitle>Change Username</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="newUsername" className="text-xs">
              New Username
            </Label>
            <Input
              type="text"
              id="newUsername"
              className="dark:bg-gray-800 dark:text-white"
              value={username}
              onChange={onUsernameChange}
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-4">
            <ul className="list-disc pl-4 space-y-1">
              <li>Username changes may take a few minutes to complete.</li>
              <li>
                Your original username will be unavailable for 90 days following
                the rename.
              </li>
            </ul>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsConfirming(false);
                onOpenChange(false);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-xs"
              variant={isConfirming ? "warning" : "default"}
            >
              {isConfirming ? "Are you sure? Click to confirm" : "Update Username"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeUsernameModal;
