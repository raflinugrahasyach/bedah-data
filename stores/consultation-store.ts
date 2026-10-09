"use client";

import { create } from "zustand";
import { api } from "@/lib/api-client";
import { EMPTY_BRIEF, OPENING_TURN, type Stage } from "@/lib/consultation";
import type { ResearchBrief } from "@/lib/types";

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

interface ConsultationState {
  messages: ChatMessage[];
  brief: ResearchBrief;
  awaiting: Stage;
  suggestions: string[];
  suggestionMode: "fill" | "send";
  status: "idle" | "sending" | "error";
  error: string | null;
  lastUserText: string | null;
  send: (text: string) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

const openingMessage: ChatMessage = { id: "opening", role: "assistant", content: OPENING_TURN.reply };

const initialState = {
  messages: [openingMessage],
  brief: EMPTY_BRIEF,
  awaiting: OPENING_TURN.awaiting,
  suggestions: OPENING_TURN.suggestions,
  suggestionMode: OPENING_TURN.suggestionMode,
  status: "idle" as const,
  error: null,
  lastUserText: null,
};

export const useConsultation = create<ConsultationState>((set, get) => {
  async function ask(text: string) {
    const { brief, awaiting } = get();
    set({ status: "sending", error: null, suggestions: [] });
    try {
      const turn = await api.chat({ message: text, brief, awaiting });
      set((state) => ({
        status: "idle",
        brief: turn.brief,
        awaiting: turn.awaiting,
        suggestions: turn.suggestions,
        suggestionMode: turn.suggestionMode,
        messages: [...state.messages, { id: crypto.randomUUID(), role: "assistant", content: turn.reply }],
      }));
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "Pesan belum terkirim. Coba lagi.",
      });
    }
  }

  return {
    ...initialState,

    send: async (raw) => {
      const text = raw.trim();
      if (!text || get().status === "sending") return;
      set((state) => ({
        lastUserText: text,
        messages: [...state.messages, { id: crypto.randomUUID(), role: "user", content: text }],
      }));
      await ask(text);
    },

    retry: async () => {
      const text = get().lastUserText;
      if (text && get().status === "error") await ask(text);
    },

    reset: () => set({ ...initialState, messages: [openingMessage] }),
  };
});
