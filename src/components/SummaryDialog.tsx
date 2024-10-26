import React, { useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Clipboard, Twitter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClipboard } from "use-clipboard-copy";

interface SummaryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string[];
  onTweet: (tweetTexts: string[]) => void;
  error: string | null;
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({
  isOpen,
  onOpenChange,
  summary,
  onTweet,
  error,
}) => {
  const clipboard = useClipboard();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tweetTexts = useMemo(() => {
    const fullText = summary.join(" ");
    const tweets = [];
    let remainingText = fullText;

    while (remainingText.length > 0) {
      if (remainingText.length <= 280) {
        tweets.push(remainingText);
        break;
      }

      let cutoff = remainingText.lastIndexOf(" ", 280);
      if (cutoff === -1) cutoff = 280;

      tweets.push(remainingText.slice(0, cutoff));
      remainingText = remainingText.slice(cutoff + 1);
    }

    return tweets;
  }, [summary]);

  const isTweetThread = tweetTexts.length > 1;

  const handleCopy = (tweet: string, index: number) => {
    clipboard.copy(tweet);
    setCopiedIndex(index);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setCopiedIndex(null);
      timeoutRef.current = null;
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Journal Summary</DialogTitle>
        </DialogHeader>
        <div className="mt-4 p-2 bg-white rounded relative flex-grow overflow-y-auto">
          {tweetTexts.map((tweet, index) => (
            <div key={index} className="mb-4 relative">
              <h3 className="text-sm font-semibold mb-1">
                {isTweetThread ? `Tweet ${index + 1}` : "Summary"}
              </h3>
              <p className="text-sm mb-2 pr-8">{tweet}</p>
              <Button
                type="button"
                onClick={() => handleCopy(tweet, index)}
                className="absolute cursor-pointer top-0 right-0 p-0 bg-gray-100 hover:bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center"
                title={`Copy Tweet ${index + 1}`}
              >
                <Clipboard size={14} className="text-black" />
              </Button>
              {copiedIndex === index && (
                <span className="absolute top-0 right-8 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  Text copied
                </span>
              )}
              <div className="flex justify-end">
                <p className="text-xs text-gray-600">
                  Characters: {tweet.length}/280
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 w-full">
          <Button
            type="button"
            onClick={() => onTweet(tweetTexts)}
            className="bg-blue-400 hover:bg-blue-500 text-white w-full py-2 px-0 cursor-pointer"
          >
            <Twitter size={16} className="mr-2" />
            {isTweetThread ? "Tweet Thread" : "Tweet"}
          </Button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
