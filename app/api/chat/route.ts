import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseBody } from "@/lib/api-response";
import { generateConsultationTurn } from "@/services/gemini";

const variablesSchema = z.object({
  summary: z.string().max(700),
  independent: z.array(z.string().max(160)).max(8),
  dependent: z.array(z.string().max(160)).max(8),
});

const bodySchema = z.object({
  message: z.string().trim().min(1, "Pesan tidak boleh kosong.").max(1200, "Pesan terlalu panjang (maks. 1200 karakter)."),
  awaiting: z.enum(["objective", "variables", "dataProfile", "method", "confirm", "done"]),
  brief: z.object({
    objective: z.string().max(700).nullable(),
    variables: variablesSchema.nullable(),
    dataProfile: z.string().max(1000).nullable(),
    method: z.string().max(700).nullable(),
  }),
});

/** Tahap 1 consultative chatbot. Gemini is mocked: see services/gemini.ts. */
export async function POST(request: Request) {
  const parsed = await parseBody(request, bodySchema);
  if (parsed.error) return parsed.error;

  try {
    const turn = await generateConsultationTurn(parsed.data);
    return NextResponse.json(turn);
  } catch {
    return jsonError("upstream_error", "Asisten sedang tidak bisa dihubungi. Coba kirim ulang pesanmu.", 502);
  }
}
