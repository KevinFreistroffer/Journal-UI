import { Button } from "@/components/ui/Button";
import { FileText } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useTheme } from "next-themes";

// Add new PublishButton component
export default function PublishButton({
  disabled,
  onPublish,
  className,
}: {
  disabled: boolean;
  onPublish: () => void;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const { theme } = useTheme();

  const bgColor =
    theme === "dark"
      ? disabled
        ? "bg-[var(--button-bg-primary)] hover:bg-[var(--button-bg-primary)]/90"
        : "bg-[var(--button-bg-primary)] hover:bg-[var(--button-bg-primary)]/90"
      : disabled
      ? "bg-blue-300 hover:bg-blue-300"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <Button
      type="button"
      disabled={disabled || pending}
      onClick={onPublish}
      className={`text-white w-full md:w-auto text-sm flex items-center justify-center rounded-sm ${bgColor} ${
        disabled ? "cursor-not-allowed" : ""
      } ${className}`}
    >
      <span className="mr-2">Publish</span>
      <FileText className="w-4 h-4" />
    </Button>
  );
}
