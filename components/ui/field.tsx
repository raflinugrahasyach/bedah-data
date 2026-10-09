"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-control border bg-field px-3 text-body text-ink placeholder:text-ink-muted transition-colors duration-[var(--duration-fast)] hover:border-ink-muted disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(controlBase, "h-11 border-border-strong", className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlBase, "min-h-11 resize-none border-border-strong py-2.5", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

interface FieldProps {
  id: string;
  label: string;
  /** Required state is announced in text, never by colour alone. */
  required?: boolean;
  hint?: string;
  error?: string | null;
  children: (aria: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    "aria-required"?: boolean;
  }) => React.ReactNode;
}

/** Label above the control, helper text, and an announced error below it. */
export function Field({ id, label, required, hint, error, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-body-sm font-medium text-ink">
        {label}
        {required ? <span className="font-normal text-ink-muted"> (wajib)</span> : null}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })}
      {hint && !error ? (
        <p id={hintId} className="text-caption text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
