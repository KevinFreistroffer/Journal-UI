import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordModal = ({
  isOpen,
  onOpenChange,
}: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      onOpenChange(false);
      // Optional: Add success message handling
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to change password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="dark:bg-neutral-900/50" />
      <DialogContent className="bg-white dark:bg-neutral-900">
        <DialogHeader>
          <DialogTitle className="text-lg">Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs">
              Current Password
            </Label>
            <Input
              type="password"
              id="currentPassword"
              className="dark:bg-gray-800 dark:text-white text-xs"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs">
              New Password
            </Label>
            <Input
              type="password"
              id="newPassword"
              className="dark:bg-gray-800 dark:text-white text-xs"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs">
              Confirm New Password
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              className="dark:bg-gray-800 dark:text-white text-xs"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="text-xs">
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
