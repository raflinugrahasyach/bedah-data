import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Status chips. Always include a text label (and ideally an icon) as well. */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-control px-2 py-0.5 text-caption font-medium [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "bg-border/70 text-ink",
        primary: "bg-primary-tint text-primary-ink",
        warn: "bg-warn-tint text-warn",
        success: "bg-success-tint text-success",
        danger: "bg-danger-tint text-danger",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
