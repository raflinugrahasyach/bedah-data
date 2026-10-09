"use client";

import { Toaster as Sonner } from "sonner";

/** Toast host, themed to tokens. Messages carry a text label; sonner adds the status icon. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      toastOptions={{
        duration: 4500,
        classNames: {
          toast:
            "!rounded-card !border-0 !bg-surface !text-ink !shadow-pop !font-sans !text-body-sm",
          description: "!text-ink-muted",
        },
      }}
    />
  );
}
