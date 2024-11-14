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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="dark:bg-white dark:bg-opacity-50" />
      <DialogContent className="bg-white dark:bg-background">
        <DialogHeader>
          <DialogTitle>Change Username</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newUsername">New Username</Label>
            <Input
              type="text"
              id="newUsername"
              value={username}
              onChange={onUsernameChange}
            />
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Username changes may take a few minutes to complete.</p>
            <p>
              Your original username will be unavailable for 90 days following
              the rename.
            </p>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Username</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeUsernameModal;
