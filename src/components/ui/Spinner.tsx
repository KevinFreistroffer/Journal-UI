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
        "flex justify-center items-center animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
        {
          "h-4 w-4 border-2": size === "xs",
          "h-6 w-6 border-3": size === "sm",
          "h-8 w-8 border-4": size === "md",
          "h-12 w-12 border-6": size === "lg",
        },
        className
      )}
      role="status"
      {...props}
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};
