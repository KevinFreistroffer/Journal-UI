import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg";
}

export const Spinner: React.FC<SpinnerProps> = ({
  className,
  size = "md",
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-2 border-b-2 border-blue-500",
        {
          "h-4 w-4 border-t border-b": size === "xs",
          "h-6 w-6 border-t-[1.5px] border-b-[1.5px]": size === "sm",
          "h-8 w-8 border-t-2 border-b-2": size === "md",
          "h-12 w-12 border-t-3 border-b-3": size === "lg",
        },
        className
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
