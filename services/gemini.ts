import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";
import type { ConsultationInput, ConsultationTurn, Stage } from "@/lib/consultation";
import type { ResearchBrief } from "@/lib/types";

export interface ChatTurnResult extends ConsultationTurn {
  meta: { model: string; mock: boolean; latencyMs: number };
}

export const SYSTEM_INSTRUCTION =
  "CRITICAL RULE: You are a strict academic methodology consultant for Bedah Data. If the user provides nonsensical, irrelevant, or uncooperative answers (e.g., 'gamau', 'lah', jokes, slang, or random words), DO NOT proceed to the next step. DO NOT extract garbage data into the brief. Instead, politely but firmly refuse to move forward, explain why their input is invalid, and ask them to provide actual academic data.";

const consultationResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    reply: {
      type: SchemaType.STRING,
      description: "Jawaban konsultasi dalam Bahasa Indonesia yang formal dan profesional.",
    },
    awaiting: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["objective", "variables", "dataProfile", "method", "confirm", "done"],
      description: "Tahap konsultasi berikutnya (tetap di tahap yang sama jika input tidak valid).",
    },
    brief: {
      type: SchemaType.OBJECT,
      properties: {
        objective: {
          type: SchemaType.STRING,
          nullable: true,
          description: "Rumusan tujuan penelitian atau null.",
        },
        variables: {
          type: SchemaType.OBJECT,
          nullable: true,
          properties: {
            summary: { type: SchemaType.STRING },
            independent: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            dependent: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ["summary", "independent", "dependent"],
        },
        dataProfile: {
          type: SchemaType.STRING,
          nullable: true,
          description: "Deskripsi profil data atau null.",
        },
        method: {
          type: SchemaType.STRING,
          nullable: true,
          description: "Nama metode analisis statistik atau null.",
        },
      },
      required: ["objective", "variables", "dataProfile", "method"],
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Rekomendasi input cepat untuk pengguna.",
    },
    suggestionMode: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["fill", "send"],
      description: "Mode saran: 'fill' untuk mengisi form atau 'send' untuk langsung kirim.",
    },
  },
  required: ["reply", "awaiting", "brief", "suggestions", "suggestionMode"],
};

/**
 * Live inference for the Tahap 1 Bedah Data consultation chatbot
 * using Google Generative AI SDK with strict structured JSON output.
 */
export async function generateConsultationTurn(input: ConsultationInput): Promise<ChatTurnResult> {
  const startedAt = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: consultationResponseSchema,
    },
  });

  const prompt = [
    `State Konsultasi Saat Ini:`,
    `- Awaiting: "${input.awaiting}"`,
    `- Brief saat ini: ${JSON.stringify(input.brief)}`,
    ``,
    `Pesan Pengguna:`,
    `"${input.message}"`,
    ``,
    `Instruksi:`,
    `- Validasi masukan sesuai tahapan konsultasi ("objective" -> "variables" -> "dataProfile" -> "confirm" -> "done").`,
    `- Jika masukan tidak valid, tidak kooperatif, lelucon, atau kata slang (misal: 'gamau', 'lah', 'kocak', 'wkwk', kata acak): tolak dengan tegas & sopan, jelaskan mengapa input tidak valid, pertahankan status awaiting tetap "${input.awaiting}", dan jangan masukkan data sampah ke dalam brief.`,
    `- Jika valid: transisikan awaiting ke tahap berikutnya, isi brief dengan data akademik pengguna, berikan saran (suggestions), dan jelaskan langkah selanjutnya secara akademik.`,
  ].join("\n");

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw = JSON.parse(text);

  const validStages: Stage[] = ["objective", "variables", "dataProfile", "method", "confirm", "done"];
  const awaiting: Stage = validStages.includes(raw.awaiting) ? raw.awaiting : input.awaiting;

  const brief: ResearchBrief = {
    objective: typeof raw.brief?.objective === "string" ? raw.brief.objective : null,
    variables:
      raw.brief?.variables && typeof raw.brief.variables === "object"
        ? {
            summary: String(raw.brief.variables.summary || ""),
            independent: Array.isArray(raw.brief.variables.independent)
              ? raw.brief.variables.independent.map(String)
              : [],
            dependent: Array.isArray(raw.brief.variables.dependent)
              ? raw.brief.variables.dependent.map(String)
              : [],
          }
        : null,
    dataProfile: typeof raw.brief?.dataProfile === "string" ? raw.brief.dataProfile : null,
    method: typeof raw.brief?.method === "string" ? raw.brief.method : null,
  };

  const suggestions: string[] = Array.isArray(raw.suggestions) ? raw.suggestions.map(String) : [];
  const suggestionMode: "fill" | "send" = raw.suggestionMode === "send" ? "send" : "fill";

  return {
    reply: String(raw.reply ?? ""),
    awaiting,
    brief,
    suggestions,
    suggestionMode,
    meta: {
      model: modelName,
      mock: false,
      latencyMs: Date.now() - startedAt,
    },
  };
}
