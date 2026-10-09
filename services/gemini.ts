import { runConsultationTurn, type ConsultationInput, type ConsultationTurn } from "@/lib/consultation";
import { env } from "@/lib/env";
import { sleep } from "@/lib/utils";

export interface ChatTurnResult extends ConsultationTurn {
  meta: { model: string; mock: true; latencyMs: number };
}

/**
 * Tahap 1 chatbot turn.
 *
 * MOCK: returns a scripted, structured response that imitates Gemini guiding a
 * thesis methodology. To go live, replace the body with a Gemini call
 * (systemInstruction = the consultation script, responseSchema = ConsultationTurn)
 * and keep the return shape; the route and UI need no changes.
 */
export async function generateConsultationTurn(input: ConsultationInput): Promise<ChatTurnResult> {
  const startedAt = Date.now();
  await sleep(600 + Math.min(input.message.length, 300) * 2);
  const turn = runConsultationTurn(input);
  return { ...turn, meta: { model: env.geminiModel, mock: true, latencyMs: Date.now() - startedAt } };
}
