import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { FaTwitter } from "react-icons/fa";

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
  const handleTweet = () => {
    const tweetText = encodeURIComponent(`Check out my journal: ${title}`);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-neutral-900/50 backdrop-blur-sm" />
      <DialogContent className="!bg-white dark:!bg-[var(--color-darker4)] w-[90vw] max-w-[51.0625rem] max-h-[95vh] mx-auto my-auto overflow-y-auto rounded-xs">
        <DialogHeader>
          <DialogTitle className="text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
            Preview
          </DialogTitle>
          <h2 className="text-xl mt-1 font-semibold text-neutral-900 dark:text-white">
            {title || "Untitled Journal"}
          </h2>
        </DialogHeader>

        <div className="mt-4 px-0">
          <div
            className="preview-content ql-editor"
            dangerouslySetInnerHTML={{
              __html: journal,
            }}
          />
        </div>

        <div
          onClick={handleTweet}
          className="fixed bottom-4 right-4 flex items-center justify-center cursor-pointer"
          style={{ width: "60px", height: "40px" }}
          title="Click to tweet your journal"
        >
          <FaTwitter size={20} color="#1DA1F2" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
