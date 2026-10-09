import { runConsultationTurn, type ConsultationInput, type ConsultationTurn } from "@/lib/consultation";
import { env } from "@/lib/env";
import { sleep } from "@/lib/utils";

export interface ChatTurnResult extends ConsultationTurn {
  meta: { model: string; mock: true; latencyMs: number };
}

export const ACADEMIC_CONSULTANT_SYSTEM_PROMPT = `
Anda adalah Konsultan Metodologi Akademik Senior di "Bedah Data", layanan analisis data skripsi dan riset akademik.
Tugas Anda adalah memandu mahasiswa menyusun brief metodologi penelitian yang akurat, terstruktur, dan akuntabel secara bertahap:
1. Tujuan Penelitian (rumusan masalah atau hipotesis)
2. Variabel Penelitian (bebas/X dan terikat/Y)
3. Profil Data (sumber instrumen/kuesioner/sekunder, jumlah sampel N, status data)
4. Rekomendasi Metode Statistik & Uji Asumsi

ATURAN KRITIS (STRICT ACADEMIC QUALITY VALIDATION):
- Anda adalah konsultan akademik yang tegas, santun, dan profesional.
- Jika pengguna memberikan masukan yang tidak masuk akal, tidak relevan, tidak kooperatif, atau bercanda (contoh: 'gamau', 'lah', 'ogah', 'males', 'kocak', 'wkwk', lelucon, kata-kata acak, curhat di luar skripsi), JANGAN PERNAH melanjutkan ke tahap berikutnya.
- JANGAN PERNAH mengekstrak data sampah (garbage data) ke dalam brief penelitian.
- Tolak masukan tersebut secara sopan namun tegas, jelaskan mengapa masukannya tidak valid secara ilmiah, dan minta pengguna memberikan data akademik yang sesungguhnya.
- Anda wajib memvalidasi kualitas masukan dengan ketat sebelum melakukan transisi status (state transition).
`;

/**
 * Tahap 1 chatbot turn.
 *
 * MOCK: returns a scripted, structured response that imitates Gemini guiding a
 * thesis methodology with strict academic validation. To go live, replace the body
 * with a Gemini call (systemInstruction = ACADEMIC_CONSULTANT_SYSTEM_PROMPT, responseSchema = ConsultationTurn)
 * and keep the return shape; the route and UI need no changes.
 */
export async function generateConsultationTurn(input: ConsultationInput): Promise<ChatTurnResult> {
  const startedAt = Date.now();
  await sleep(600 + Math.min(input.message.length, 300) * 2);
  const turn = runConsultationTurn(input);
  return { ...turn, meta: { model: env.geminiModel, mock: true, latencyMs: Date.now() - startedAt } };
}
