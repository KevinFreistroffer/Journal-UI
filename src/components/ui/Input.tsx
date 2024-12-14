import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  focusVisible?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, focusVisible, ...props }, ref) => {
    const showFocusVisible = focusVisible ?? true;
    return (
      <input
        name={props.name}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          "border-gray-400",
          "dark:border-gray-600",
          // Only set bg- classes if they are not already set in className
          !className?.includes("bg-")
            ? "bg-white dark:bg-[var(--color-darker3)]"
            : "",
          showFocusVisible &&
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:focus-visible:ring-[var(--button-bg-base)] focus-visible:ring-offset-1",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
