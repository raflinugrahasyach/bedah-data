"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PaperPlaneRight,
  ArrowClockwise,
  Robot,
  CircleNotch,
  ListBullets,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { ChatMessageItem } from "@/components/consultation/chat-message-item";
import { BriefSummaryPanel } from "@/components/consultation/brief-summary-panel";
import { CheckoutDialog } from "@/components/consultation/checkout-dialog";
import { useConsultation } from "@/stores/consultation-store";
import type { CompletedBrief } from "@/lib/types";

export default function KonsultasiPage() {
  const {
    messages,
    brief,
    awaiting,
    suggestions,
    suggestionMode,
    status,
    error,
    send,
    retry,
    reset,
  } = useConsultation();

  const [input, setInput] = React.useState("");
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || status === "sending") return;
    const text = input;
    setInput("");
    await send(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestionMode === "send") {
      send(suggestion);
    } else {
      setInput(suggestion);
      textareaRef.current?.focus();
    }
  };

  // Convert current brief to CompletedBrief if all 4 fields are present
  const completedBrief: CompletedBrief | null =
    brief.objective && brief.variables && brief.dataProfile && brief.method
      ? {
          objective: brief.objective,
          variables: brief.variables,
          dataProfile: brief.dataProfile,
          method: brief.method,
        }
      : null;

  return (
    <div className="flex h-svh flex-col bg-bg text-ink">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Kembali</span>
            </Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-control bg-primary text-on-primary font-mono text-xs font-bold">
              BD
            </span>
            <h1 className="text-body-sm font-semibold text-ink">
              Tahap 1: Konsultasi Metodologi & Intake Brief
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            title="Mulai Ulang Percakapan"
          >
            <ArrowClockwise size={16} />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-bg">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="mx-auto max-w-2xl space-y-2">
              <div className="rounded-control bg-field border border-border p-3 text-caption text-ink-muted text-center mb-4">
                Asisten ini menganalisis tujuan, variabel bebas/terikat, dan profil datamu untuk merekomendasikan metode uji statistik yang valid.
              </div>

              {messages.map((m) => (
                <ChatMessageItem key={m.id} message={m} />
              ))}

              {status === "sending" && (
                <div className="flex items-center gap-2 py-3 text-body-sm text-ink-muted">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-control bg-primary text-on-primary font-mono text-xs font-bold">
                    BD
                  </div>
                  <div className="flex items-center gap-2 rounded-card border border-border bg-surface px-4 py-3 text-caption text-ink-muted">
                    <CircleNotch size={16} className="animate-spin text-primary" />
                    <span>Sedang memproses rekomendasi metodologi...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-control border border-danger/30 bg-danger-tint p-3 text-body-sm text-danger flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="danger" size="sm" onClick={retry}>
                    Coba Lagi
                  </Button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestions Bar */}
          {suggestions.length > 0 && status !== "sending" && (
            <div className="border-t border-border bg-surface/50 px-4 py-2 sm:px-6">
              <div className="mx-auto max-w-2xl">
                <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wider block mb-1.5">
                  {suggestionMode === "send" ? "Pilihan Jawaban Cepat:" : "Saran Kalimat (Klik untuk Mengisi):"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className="cursor-pointer rounded-control border border-border-strong bg-field px-2.5 py-1 text-caption text-ink hover:bg-primary-tint hover:border-primary transition-colors text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="border-t border-border bg-surface p-4 sm:px-6">
            <form onSubmit={handleSend} className="mx-auto max-w-2xl flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis jawabanmu... (Tekan Enter untuk mengirim)"
                rows={2}
                disabled={status === "sending"}
                className="min-h-12 flex-1 resize-none py-2 text-body-sm"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="self-end"
                disabled={!input.trim() || status === "sending"}
              >
                <PaperPlaneRight size={18} />
                <span className="hidden sm:inline">Kirim</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Brief Inspector */}
        <aside className="hidden lg:block w-80 xl:w-96 border-l border-border bg-surface p-4 overflow-y-auto">
          <BriefSummaryPanel
            brief={brief}
            onProceedToOrder={() => setCheckoutOpen(true)}
          />
        </aside>
      </div>

      {/* Floating Checkout button on mobile if brief is complete */}
      <div className="lg:hidden border-t border-border bg-surface p-3">
        <Button
          onClick={() => setCheckoutOpen(true)}
          disabled={!completedBrief}
          variant="primary"
          className="w-full"
        >
          <span>
            {completedBrief
              ? "Kirim Brief & Buat Pesanan (4/4 Lengkap)"
              : "Lengkapi Brief di Obrolan"}
          </span>
        </Button>
      </div>

      {/* Checkout & Midtrans Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        brief={completedBrief}
      />
    </div>
  );
}
