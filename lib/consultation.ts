/**
 * Scripted consultation logic for the Tahap 1 chatbot.
 *
 * This simulates how Gemini would guide a student's thesis methodology:
 * objective -> variables -> data profile -> method recommendation -> confirmation.
 * It is pure (no I/O, no alias imports) so services/gemini.ts can wrap it with
 * latency and a real model can later replace it behind the same contract.
 */
import type { BriefVariables, ResearchBrief } from "./types";

export type Stage = "objective" | "variables" | "dataProfile" | "method" | "confirm" | "done";

export interface ConsultationInput {
  message: string;
  brief: ResearchBrief;
  awaiting: Stage;
}

export interface ConsultationTurn {
  reply: string;
  awaiting: Stage;
  brief: ResearchBrief;
  suggestions: string[];
  /** "fill" puts the suggestion in the composer for editing; "send" sends it right away. */
  suggestionMode: "fill" | "send";
}

export const EMPTY_BRIEF: ResearchBrief = {
  objective: null,
  variables: null,
  dataProfile: null,
  method: null,
};

export const OPENING_TURN: Pick<ConsultationTurn, "reply" | "awaiting" | "suggestions" | "suggestionMode"> = {
  reply:
    "Halo, saya asisten konsultasi Bedah Data. Saya akan menanyakan empat hal: tujuan penelitian, variabel, profil data, lalu merekomendasikan metode analisis.\n\nMulai dari yang pertama: **apa yang ingin kamu buktikan atau jawab lewat penelitianmu?**",
  awaiting: "objective",
  suggestions: [
    "Pengaruh kualitas layanan terhadap kepuasan pelanggan",
    "Perbedaan nilai ujian antara siswa yang belajar daring dan tatap muka",
    "Hubungan antara stres kerja dan kinerja karyawan",
  ],
  suggestionMode: "fill",
};

const MAX_FIELD = 600;
const clip = (text: string, max = MAX_FIELD) => text.trim().replace(/\s+/g, " ").slice(0, max);

/* ------------------------------------------------------------------ */
/* Parsing helpers                                                     */
/* ------------------------------------------------------------------ */

function splitList(text: string): string[] {
  return text
    .split(/\s*(?:,|;|\n|&|\+|\bdan\b)\s*/i)
    .map((item) => item.replace(/^(?:variabel|var)\s+/i, "").replace(/[.\s]+$/g, "").trim())
    .filter((item) => item.length > 1)
    .slice(0, 8);
}

function variablesFromObjective(objective: string | null): { independent: string[]; dependent: string[] } | null {
  if (!objective) return null;
  const effect = objective.match(/pengaruh\s+(.+?)\s+(?:terhadap|pada|kepada)\s+(.+)/i);
  if (effect) return { independent: splitList(effect[1]), dependent: splitList(effect[2]) };
  const relation = objective.match(/hubungan\s+(?:antara\s+)?(.+?)\s+(?:dengan|dan)\s+(.+)/i);
  if (relation) return { independent: splitList(relation[1]), dependent: splitList(relation[2]) };
  return null;
}

export function parseVariables(text: string, objective: string | null): BriefVariables {
  const clean = text.replace(/\s+/g, " ").trim();

  const independentMatch = clean.match(
    /(?:\bbebas\b|\bindependen\b|\bindependent\b|\bx\b)(?:\s*\(\s*x\s*\))?\s*[:=]?\s*(.+?)(?=\s*[;.]?\s*(?:variabel\s+)?(?:\bterikat\b|\bdependen\b|\bdependent\b|\by\b)|$)/i,
  );
  const dependentMatch = clean.match(
    /(?:\bterikat\b|\bdependen\b|\bdependent\b|\by\b)(?:\s*\(\s*y\s*\))?\s*[:=]?\s*(.+?)\s*(?:[;.]|$)/i,
  );

  let independent = independentMatch ? splitList(independentMatch[1]) : [];
  let dependent = dependentMatch ? splitList(dependentMatch[1]) : [];

  if (independent.length === 0 && dependent.length === 0) {
    const fallback = variablesFromObjective(objective);
    const wantsFallback = /ikut|sesuai|sama|dari tujuan/i.test(clean);
    if (fallback && wantsFallback) {
      independent = fallback.independent;
      dependent = fallback.dependent;
    }
  }

  return { summary: clip(clean), independent, dependent };
}

interface DataProfile {
  n: number | null;
  likert: boolean;
  secondary: boolean;
  panel: boolean;
  timeSeries: boolean;
  notYet: boolean;
}

function readDataProfile(text: string): DataProfile {
  const n = text.match(
    /(\d{1,5})\s*(?:responden|sampel|orang|partisipan|observasi|data|mahasiswa|karyawan|siswa|pelanggan|perusahaan)/i,
  );
  return {
    n: n ? Number(n[1]) : null,
    likert: /likert|kuesioner|kuisioner|angket|skala/i.test(text),
    secondary: /sekunder|laporan keuangan|\bbei\b|\bbps\b|\bpanel\b|time series|runtut/i.test(text),
    panel: /\bpanel\b/i.test(text),
    timeSeries: /time series|runtut waktu|tahunan|bulanan/i.test(text),
    notYet: /belum (?:ada|punya|ambil|disebar)/i.test(text),
  };
}

/* ------------------------------------------------------------------ */
/* Method recommendation                                               */
/* ------------------------------------------------------------------ */

export interface MethodRecommendation {
  method: string;
  reasons: string[];
  checks: string[];
}

export function recommendMethod(brief: ResearchBrief, dataProfileText: string): MethodRecommendation {
  const variables = brief.variables;
  const text = `${brief.objective ?? ""} ${variables?.summary ?? ""} ${dataProfileText}`.toLowerCase();
  const data = readDataProfile(dataProfileText);
  const reasons: string[] = [];
  const checks: string[] = [];
  let method: string;

  if (/mediasi|moderasi|intervening|\bsem\b|\bpls\b/.test(text)) {
    method = "PLS-SEM (analisis jalur dengan mediasi atau moderasi)";
    reasons.push("Tujuanmu melibatkan peran variabel perantara atau penguat antarvariabel.");
    checks.push(
      "Validitas konvergen dan diskriminan (outer model)",
      "Reliabilitas komposit dan Cronbach's alpha",
      "Bootstrapping untuk menguji signifikansi jalur",
    );
  } else if (data.panel) {
    method = "Regresi data panel (CEM, FEM, atau REM, dipilih lewat uji Chow dan Hausman)";
    reasons.push("Datamu berbentuk panel: beberapa unit diamati pada beberapa periode.");
    checks.push("Uji Chow, Hausman, dan Lagrange Multiplier", "Uji asumsi klasik pada model terpilih");
  } else if (/perbedaan|beda\b|membandingkan|komparasi|dibandingkan/.test(text)) {
    const paired = /sebelum|sesudah|pre-?test|post-?test|eksperimen/.test(text);
    const manyGroups = /anova|tiga kelompok|3 kelompok|beberapa kelompok|empat kelompok/.test(text);
    method = paired
      ? "Uji t berpasangan (paired t-test)"
      : manyGroups
        ? "ANOVA satu arah dengan uji lanjut (post-hoc)"
        : "Uji t sampel independen (independent t-test)";
    reasons.push("Tujuanmu membandingkan nilai antar kelompok atau antar waktu.");
    checks.push(
      "Uji normalitas (Shapiro-Wilk atau Kolmogorov-Smirnov)",
      paired ? "Cek selisih skor berpasangan" : "Uji homogenitas varians (Levene)",
      "Alternatif non-parametrik bila asumsi tidak terpenuhi",
    );
  } else if (/hubungan|korelasi|asosiasi/.test(text)) {
    method = "Korelasi Pearson (atau Spearman bila data tidak normal)";
    reasons.push("Tujuanmu melihat kekuatan dan arah hubungan dua variabel, bukan sebab-akibat.");
    checks.push("Uji normalitas untuk memilih Pearson atau Spearman", "Pemeriksaan pencilan (outlier)");
  } else if (/pengaruh|berpengaruh|dampak|faktor/.test(text)) {
    const many = (variables?.independent.length ?? 0) > 1;
    method = many ? "Regresi linear berganda" : "Regresi linear sederhana";
    reasons.push(
      many
        ? "Ada lebih dari satu variabel bebas yang diuji pengaruhnya terhadap satu variabel terikat."
        : "Ada satu variabel bebas yang diuji pengaruhnya terhadap variabel terikat.",
    );
    checks.push(
      "Uji asumsi klasik: normalitas residual, multikolinearitas (VIF), heteroskedastisitas",
      "Uji t (parsial), uji F (simultan), dan koefisien determinasi (R²)",
    );
    if (data.timeSeries) checks.push("Uji autokorelasi (Durbin-Watson) karena data berurutan waktu");
  } else {
    method = "Statistik deskriptif sebagai titik awal (analis akan menyesuaikan setelah meninjau brief)";
    reasons.push("Tujuanmu belum mengarah ke uji hipotesis tertentu, jadi gambaran data dulu yang paling aman.");
    checks.push("Frekuensi, rata-rata, dan sebaran tiap variabel");
  }

  if (data.likert) {
    checks.unshift("Uji validitas dan reliabilitas instrumen (Cronbach's alpha)");
    reasons.push("Datamu berasal dari kuesioner berskala, jadi instrumen perlu diuji dulu.");
  }
  if (data.n !== null && data.n < 30) {
    reasons.push(
      `Jumlah sampel kecil (n = ${data.n}): analis akan memeriksa kecukupan sampel dan mempertimbangkan uji non-parametrik.`,
    );
  }
  if (data.notYet) {
    reasons.push("Data belum ada: desain pengumpulan data akan dibahas analis di sesi call.");
  }

  return { method, reasons, checks };
}

/* ------------------------------------------------------------------ */
/* Turn runner                                                         */
/* ------------------------------------------------------------------ */

const bullets = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

function describeVariables(variables: BriefVariables): string {
  if (variables.independent.length === 0 && variables.dependent.length === 0) {
    return "Variabel sudah saya catat apa adanya; analis akan memetakannya ke variabel bebas dan terikat.";
  }
  const parts: string[] = [];
  if (variables.independent.length) parts.push(`variabel bebas: **${variables.independent.join(", ")}**`);
  if (variables.dependent.length) parts.push(`variabel terikat: **${variables.dependent.join(", ")}**`);
  return `Saya catat ${parts.join(" dan ")}.`;
}

export function runConsultationTurn({ message, brief, awaiting }: ConsultationInput): ConsultationTurn {
  const text = clip(message);
  const keep = (next: Partial<ResearchBrief> = {}): ResearchBrief => ({ ...brief, ...next });

  switch (awaiting) {
    case "objective": {
      if (text.length < 12) {
        return {
          reply:
            "Boleh lebih spesifik? Tujuan penelitian biasanya satu kalimat, misalnya **pengaruh X terhadap Y** atau **perbedaan Y antara dua kelompok**.",
          awaiting: "objective",
          brief,
          suggestions: OPENING_TURN.suggestions,
          suggestionMode: "fill",
        };
      }
      const lead = /pengaruh|dampak|faktor/i.test(text)
        ? "Itu pertanyaan sebab-akibat."
        : /perbedaan|beda|membandingkan/i.test(text)
          ? "Itu pertanyaan perbandingan antar kelompok."
          : /hubungan|korelasi/i.test(text)
            ? "Itu pertanyaan tentang hubungan antarvariabel."
            : "Tujuannya sudah saya catat.";
      const next = keep({ objective: text });
      const derived = variablesFromObjective(text);
      return {
        reply: `${lead}\n\nSekarang variabelnya. **Sebutkan variabel bebas (X) dan variabel terikat (Y).** Kalau ada lebih dari satu, pisahkan dengan koma.`,
        awaiting: "variables",
        brief: next,
        suggestions: derived
          ? [
              `Variabel bebas: ${derived.independent.join(", ")}. Variabel terikat: ${derived.dependent.join(", ")}.`,
            ]
          : ["Variabel bebas: motivasi belajar, disiplin. Variabel terikat: prestasi akademik."],
        suggestionMode: "fill",
      };
    }

    case "variables": {
      if (text.length < 3) {
        return {
          reply: "Saya belum menangkap variabelnya. Tulis seperti: **Variabel bebas: ..., variabel terikat: ...**",
          awaiting: "variables",
          brief,
          suggestions: [],
          suggestionMode: "fill",
        };
      }
      const variables = parseVariables(text, brief.objective);
      return {
        reply: `${describeVariables(variables)}\n\nSekarang profil datamu. **Ceritakan sumber data** (primer lewat kuesioner atau sekunder), **jumlah sampel**, dan **apakah datanya sudah terkumpul.**`,
        awaiting: "dataProfile",
        brief: keep({ variables }),
        suggestions: [
          "Data primer dari kuesioner skala Likert, 120 responden, sudah terkumpul tapi belum dibersihkan.",
          "Data sekunder laporan keuangan 30 perusahaan selama 5 tahun (panel).",
        ],
        suggestionMode: "fill",
      };
    }

    case "dataProfile": {
      if (text.length < 8) {
        return {
          reply:
            "Satu kalimat lagi ya: dari mana datanya, berapa jumlahnya, dan sudah terkumpul atau belum?",
          awaiting: "dataProfile",
          brief,
          suggestions: [],
          suggestionMode: "fill",
        };
      }
      const next = keep({ dataProfile: text });
      const rec = recommendMethod(next, text);
      return {
        reply: `Dari tujuan, variabel, dan profil datamu, saya sarankan **${rec.method}**.\n\nAlasannya:\n${bullets(rec.reasons)}\n\nYang akan diperiksa analis:\n${bullets(rec.checks)}\n\n**Apakah metode ini sudah sesuai dengan arahan dosen pembimbingmu?**`,
        awaiting: "confirm",
        brief: { ...next, method: rec.method },
        suggestions: ["Ya, sesuai.", "Dosen saya meminta metode lain."],
        suggestionMode: "send",
      };
    }

    case "confirm": {
      const accepts = /^(?:ya|iya|oke|ok|setuju|sesuai|lanjut|betul|benar)\b/i.test(text);
      const namesMethod = /regresi|anova|t-?test|uji t|korelasi|\bsem\b|\bpls\b|deskriptif|chi-?square|mann|wilcoxon|panel/i.test(text);
      if (!accepts && namesMethod) {
        return finish(keep({ method: text }), "Metode dari dosenmu sudah saya catat; analis akan mengikutinya.");
      }
      if (accepts) {
        return finish(brief, "Metode rekomendasi saya pakai.");
      }
      return {
        reply: "Baik. **Tulis metode yang diminta dosenmu** (misalnya \"regresi data panel\" atau \"ANOVA\"), nanti analis yang mengikutinya.",
        awaiting: "method",
        brief,
        suggestions: [],
        suggestionMode: "fill",
      };
    }

    case "method": {
      if (text.length < 3) {
        return {
          reply: "Metodenya belum terbaca. Tulis nama metodenya, misalnya **regresi logistik** atau **uji Mann-Whitney**.",
          awaiting: "method",
          brief,
          suggestions: [],
          suggestionMode: "fill",
        };
      }
      return finish(keep({ method: text }), "Metode dari dosenmu sudah saya catat; analis akan mengikutinya.");
    }

    case "done":
    default: {
      const note = clip(`${brief.dataProfile ?? ""} Catatan tambahan: ${text}`, 900);
      return {
        reply: "Sudah saya catat sebagai catatan tambahan untuk analis. Kalau sudah cukup, kirim brief dari panel ringkasan.",
        awaiting: "done",
        brief: keep({ dataProfile: note }),
        suggestions: [],
        suggestionMode: "fill",
      };
    }
  }
}

function finish(brief: ResearchBrief, lead: string): ConsultationTurn {
  return {
    reply: `${lead}\n\nBriefmu sudah lengkap. **Periksa ringkasannya, lalu kirim ke analis.** Setelah itu ada estimasi harga, pembayaran, dan jadwal call singkat.`,
    awaiting: "done",
    brief,
    suggestions: [],
    suggestionMode: "fill",
  };
}

export function countFilled(brief: ResearchBrief): number {
  return [brief.objective, brief.variables, brief.dataProfile, brief.method].filter(Boolean).length;
}
