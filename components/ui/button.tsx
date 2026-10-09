"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * One primary style (solid teal), reused everywhere. Secondary is an outline,
 * quieter. State changes are colour-only (no transforms), per no-slop-ui.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control text-button font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)] disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-press",
        secondary:
          "border border-border-strong bg-field text-ink hover:bg-primary-tint active:bg-border",
        ghost: "text-ink hover:bg-border/60 active:bg-border",
        danger: "bg-danger text-on-primary hover:bg-[#9f1239] active:bg-[#881337]",
      },
      size: {
        sm: "h-9 px-3 text-body-sm",
        md: "h-11 px-4",
        lg: "h-12 px-6 text-body",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner, disables the control and announces busy state. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <CircleNotchIcon className="animate-spin" aria-hidden /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
