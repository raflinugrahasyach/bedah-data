"use client";

import { Robot, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/stores/consultation-store";

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-3",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      {isAssistant && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-control bg-primary text-on-primary font-mono text-xs font-bold">
          BD
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-card px-4 py-3 text-body-sm leading-relaxed",
          isAssistant
            ? "bg-surface border border-border text-ink shadow-xs"
            : "bg-primary text-on-primary",
        )}
      >
        <div className="whitespace-pre-wrap">
          {message.content.split("\n\n").map((paragraph, pIdx) => (
            <p key={pIdx} className={cn(pIdx > 0 && "mt-2.5")}>
              {renderFormattedText(paragraph, !isAssistant)}
            </p>
          ))}
        </div>
      </div>

      {!isAssistant && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-control bg-field border border-border text-ink-muted">
          <User size={16} />
        </div>
      )}
    </div>
  );
}

function renderFormattedText(text: string, isUser: boolean) {
  // Support simple bold formatting: **bold**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={i}
          className={cn(
            "font-semibold",
            isUser ? "text-on-primary underline decoration-white/40" : "text-ink",
          )}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
