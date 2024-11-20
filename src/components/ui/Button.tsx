"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium cursor-pointer",
  {
    variants: {
      variant: {
        default: [
          "dark:bg-primary-dark dark:text-primary-dark-foreground dark:hover:bg-primary-dark/90",
          "bg-primary-light text-primary-light-foreground hover:bg-primary-light/90",
        ].join(" "),
        destructive: [
          "dark:bg-destructive-dark dark:text-destructive-dark-foreground dark:hover:bg-destructive-dark/90",
          "bg-destructive-light text-destructive-light-foreground hover:bg-destructive-light/90",
        ].join(" "),
        outline: [
          "dark:border-input-dark dark:bg-background-dark dark:hover:bg-accent-dark dark:hover:text-accent-dark-foreground",
          "border border-input-light bg-background-light hover:bg-accent-light hover:text-accent-light-foreground",
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
        default: "h-10 px-4 py-2",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
