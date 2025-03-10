"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-all duration-150",
  {
    variants: {
      variant: {
        default: [
          "dark:bg-[var(--button-bg-primary)] dark:text-primary-dark-foreground dark:hover:bg-[var(--button-bg-primary-hover)]",
          "bg-black text-white hover:bg-black/90",
        ].join(" "),
        destructive: [
          "dark:bg-red-600 dark:text-white dark:hover:bg-red-700",
          "bg-red-500 text-white hover:bg-red-600",
        ].join(" "),
        outline: [
          "dark:border-[var(--color-darker4)] bg-transparent dark:hover:bg-accent-dark dark:hover:text-accent-dark-foreground",
          "border border-grey-500 hover:bg-accent-light hover:text-accent-light-foreground",
        ].join(" "),
        secondary: [
          "dark:bg-secondary-dark dark:text-secondary-dark-foreground dark:hover:bg-secondary-dark/80",
          "bg-secondary-light text-secondary-light-foreground hover:bg-secondary-light/80",
        ].join(" "),
        ghost: [
          "dark:hover:bg-accent-dark dark:hover:text-accent-dark-foreground",
          "hover:bg-accent-light hover:text-accent-light-foreground",
        ].join(" "),
        link: [
          "dark:text-primary-dark dark:hover:underline",
          "text-primary-light underline-offset-4 hover:underline",
        ].join(" "),
        warning: [
          "dark:bg-yellow-500 dark:text-black dark:hover:bg-yellow-600",
          "bg-yellow-400 text-black hover:bg-yellow-500",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-0",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Check if 'rounded' is present in className
    const hasRoundedClass = className
      ?.split(" ")
      .some((cls) => cls.startsWith("rounded"));

    // If no 'rounded' class is found, append 'rounded-md'
    const finalClassName = hasRoundedClass
      ? className
      : `${className} rounded-md`;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className: finalClassName })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
