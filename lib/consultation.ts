/**
 * Scripted consultation logic for the Tahap 1 chatbot.
 *
 * Strict Academic Methodology Consultant:
 * Validates input quality at every stage. If the user provides nonsensical,
 * irrelevant, or uncooperative answers (e.g. 'gamau', 'lah', jokes, random words),
 * it refuses to advance, explains why the input is invalid, and requests actual
 * academic data without extracting garbage into the brief.
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
    "Halo, saya asisten metodologi Bedah Data. Saya akan memandu penyusunan brief penelitianmu: tujuan penelitian, variabel, profil data, lalu merekomendasikan metode analisis statistik yang akuntabel.\n\nMulai dari yang pertama: **apa rumusan tujuan penelitian atau hipotesis utama skripsimu?**",
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
/* Strict Quality & Academic Validation Helpers                        */
/* ------------------------------------------------------------------ */

/**
 * Checks for uncooperative refusal, slang dismissals, laughter, gibberish, or jokes.
 */
export function checkGeneralUncooperative(text: string): string | null {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Extreme shortness
  if (clean.length < 3) {
    return "Jawaban terlalu singkat. Mohon berikan informasi akademik yang jelas dan lengkap.";
  }

  // 2. Gibberish, repeated characters (e.g. "aaaaa", "zzzzz"), or keyboard mash
  if (
    /^(.)\1{2,}$/.test(lower) ||
    /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(lower) ||
    /(?:asdf|qwerty|zxcv|hjkl|ghjkl|uiop|dfgh)/i.test(lower)
  ) {
    return "Teks yang kamu masukkan terdeteksi sebagai karakter acak. Sebagai konsultan metodologi akademik, saya membutuhkan data penelitian yang sesungguhnya.";
  }

  if (/^(?:12345+|testing|test123|hallo?|halo?\s*halo?)$/i.test(lower)) {
    return "Teks pengujian acak tidak dapat diproses. Mohon masukkan data penelitian skripsi atau risetmu.";
  }

  // 3. Uncooperative slang, refusal, resistance, sarcasm, or dismissals
  const uncooperativeKeywords =
    /\b(?:gamau|gak\s*mau|nggak\s*mau|ga\s*mau|ogah|males|mager|bodo(?:\s*amat)?|terserah|apaan(?:\s*sih)?|lah|lah\s*kok|kok\s*gitu|kocak|gajelas|ga\s*jelas|skip|nanti\s*aja|gabut|capek|tidur\s*aja|nikah\s*aja|au\s*ah|ywdh|yaudah|gatau|nggak\s*tahu|gak\s*tau|ga\s*tau|bukan\s*urusanmu|rahasia|ada\s*deh|kepo|lu\s*siapa|kamu\s*siapa|bot\s*bego|lawak)\b/i;

  if (uncooperativeKeywords.test(lower)) {
    return "Sebagai konsultan metodologi akademik Bedah Data, saya hanya dapat memproses informasi yang relevan dengan penelitian atau skripsimu. Mohon berikan data akademik yang sebenarnya agar analisis dapat dirumuskan.";
  }

  // 4. Laughter or slang noise anywhere
  if (/\b(?:(?:ha){2,}h?|(?:wk){2,}|(?:he){2,}h?|(?:xi){2,}|(?:awok)+|lol+|lmao+|rofl+)\b/i.test(lower)) {
    return "Masukan terdeteksi mengandung lelucon atau ekspresi non-formal. Mohon sampaikan data penelitian skripsimu secara formal dan terstruktur.";
  }

  // 5. Casual/irrelevant chatter or off-topic requests
  if (
    /\b(?:siapa\s*(?:kamu|anda|lu|lo|namamu|nama\s*anda|nama\s*kamu)|(?:kamu|anda|lu|lo)\s*siapa|kamu\s*ai(?:\s*ya)?|lagi\s*(?:apa|ngapain)|ceritakan\s*lelucon|buatkan\s*puisi|cuaca\s*(?:hari\s*ini|besok)?|mau\s*makan|makan\s*bakso|resep\s*makanan|lapar|haus|main\s*game|mobile\s*legends|valorant)\b/i.test(
      lower
    )
  ) {
    return "Layanan ini khusus untuk perancangan metodologi penelitian akademik. Mohon masukkan informasi yang berkaitan dengan skripsi atau risetmu.";
  }

  return null;
}

/**
 * Validates whether the text represents an actual academic research objective.
 */
export function validateObjective(text: string): { valid: boolean; feedback?: string } {
  const generalErr = checkGeneralUncooperative(text);
  if (generalErr) return { valid: false, feedback: generalErr };

  const clean = text.trim();
  const lower = clean.toLowerCase();

  const words = clean.split(/\s+/).filter((w) => w.length > 1);
  if (words.length < 3 || clean.length < 14) {
    return {
      valid: false,
      feedback:
        "Tujuan penelitian belum lengkap. Rumusan tujuan riset umumnya berupa kalimat terstruktur, misalnya: **Pengaruh X terhadap Y**, **Hubungan antara X dan Y**, atau **Perbedaan Y antar kelompok**.",
    };
  }

  // Must contain academic purpose keywords or recognized research constructs with relational prepositions
  const academicPurposeKeywords =
    /\b(?:pengaruh|hubungan|perbedaan|analisis|dampak|faktor|efektivitas|peran|evaluasi|tingkat|kontribusi|determinan|komparasi|studi|pengukuran|korelasi|menguji|mengetahui|membuktikan|membandingkan|meneliti|eksplorasi|pemodelan|prediksi|identifikasi|gambaran|sebaran|variabel|hipotesis|signifikan)\b/i;

  const academicConstructKeywords =
    /\b(?:kepuasan|kinerja|motivasi|loyalitas|kualitas|harga|profitabilitas|likuiditas|leverage|nilai\s*perusahaan|prestasi|hasil\s*belajar|stres|kecemasan|efikasi|perilaku|persepsi|adopsi|minat|turnover|produktivitas|kebijakan|kepatuhan|pemahaman|kompetensi|disiplin|pelayanan|produk|keuangan|saham|return|brand|citra|manajemen|pendidikan|kesehatan|siswa|mahasiswa|karyawan|konsumen|pelanggan|masyarakat|pasien)\b/i;

  const hasPurpose = academicPurposeKeywords.test(lower);
  const hasConstruct = academicConstructKeywords.test(lower);
  const hasRelationshipPrepositions = /\b(?:terhadap|pada|dengan|antara|antar\s*kelompok|dalam)\b/i.test(lower);

  if (!hasPurpose && !(hasConstruct && hasRelationshipPrepositions)) {
    return {
      valid: false,
      feedback:
        "Masukan belum memuat rumusan tujuan penelitian yang valid secara akademik. Tujuan riset harus menjelaskan fenomena atau hubungan yang diteliti (contoh: *Pengaruh Kualitas Pelayanan terhadap Kepuasan Pelanggan* atau *Perbedaan Nilai Ujian Siswa Daring dan Tatap Muka*). Mohon tuliskan tujuan penelitianmu.",
    };
  }

  return { valid: true };
}

/**
 * Validates whether the text contains research variables or a valid reference to the objective.
 */
export function validateVariables(text: string, objective: string | null): { valid: boolean; feedback?: string } {
  const generalErr = checkGeneralUncooperative(text);
  if (generalErr) return { valid: false, feedback: generalErr };

  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Allowed reference to existing objective
  if (/\b(?:ikut|sesuai|sama|dari\s*tujuan|seperti\s*di\s*atas)\b/i.test(lower)) {
    if (objective) {
      const derived = variablesFromObjective(objective);
      if (derived && (derived.independent.length > 0 || derived.dependent.length > 0)) {
        return { valid: true };
      }
    }
  }

  // Reject generic or evasive single phrases
  if (/^(?:ada|banyak|bisa|data|skripsi|riset|variabel|bebas|terserah)$/i.test(lower)) {
    return {
      valid: false,
      feedback:
        "Masukan tidak memuat nama variabel spesifik. Mohon sebutkan variabel bebas (X) dan variabel terikat (Y) yang kamu teliti.",
    };
  }

  const hasExplicitLabels = /(?:\bbebas\b|\bindependen\b|\bindependent\b|\bx\b|terikat\b|\bdependen\b|\bdependent\b|\by\b|mediasi|moderasi)/i.test(lower);
  const parsed = parseVariables(text, objective);
  const allExtracted = [...parsed.independent, ...parsed.dependent];

  if (allExtracted.length === 0) {
    return {
      valid: false,
      feedback:
        "Input tersebut tidak dapat diidentifikasi sebagai variabel penelitian. Dalam penelitian ilmiah, variabel merupakan konsep terukur (contoh: *Variabel bebas (X): Disiplin Kerja, Motivasi; Variabel terikat (Y): Kinerja Karyawan*). Mohon sebutkan variabel penelitianmu.",
    };
  }

  // Reject garbage, uncooperative words, or single-character noise inside extracted variables
  const invalidVar = allExtracted.find((v) => checkGeneralUncooperative(v) !== null || v.trim().length < 2);
  if (invalidVar) {
    return {
      valid: false,
      feedback:
        "Nama variabel yang kamu masukkan tidak valid secara akademik. Pastikan nama variabel bebas (X) dan terikat (Y) merupakan konsep ilmiah yang terukur (misal: Kompensasi, Kepuasan Kerja, Hasil Belajar).",
    };
  }

  if (!hasExplicitLabels && allExtracted.length < 2 && clean.split(/\s+/).length < 2) {
    return {
      valid: false,
      feedback:
        "Input tersebut tidak dapat diidentifikasi sebagai variabel penelitian. Dalam penelitian ilmiah, variabel merupakan konsep terukur (contoh: *Variabel bebas (X): Disiplin Kerja, Motivasi; Variabel terikat (Y): Kinerja Karyawan*). Mohon sebutkan variabel penelitianmu.",
    };
  }

  return { valid: true };
}

/**
 * Validates whether the text describes a substantive academic data profile.
 */
export function validateDataProfile(text: string): { valid: boolean; feedback?: string } {
  const generalErr = checkGeneralUncooperative(text);
  if (generalErr) return { valid: false, feedback: generalErr };

  const clean = text.trim();
  const lower = clean.toLowerCase();

  if (clean.length < 8) {
    return {
      valid: false,
      feedback:
        "Keterangan profil data terlalu singkat. Sebutkan sumber data (primer/sekunder), estimasi jumlah sampel/responden, dan apakah data sudah terkumpul.",
    };
  }

  const hasSourceOrInstrument =
    /\b(?:primer|sekunder|kuesioner|kuisioner|angket|survei|skala|likert|laporan\s*keuangan|bei|idx|bps|dokumentasi|observasi|wawancara|panel|time\s*series|runtut\s*waktu|cross\s*section|eksperimen|pre-?test|post-?test|data\s*riil|arsip)\b/i.test(lower);

  const hasSampleSize =
    /\b\d+\s*(?:responden|sampel|orang|partisipan|observasi|data|mahasiswa|karyawan|siswa|pelanggan|perusahaan|bank|emiten|tahun|bulan|hari|unit|kasus|n\b)/i.test(lower) ||
    /\b(?:jumlah\s*sampel|ukuran\s*sampel|sampel\s*sebanyak|total\s*responden)\b/i.test(lower);

  const hasCollectionStatus =
    /\b(?:sudah\s*(?:ada|terkumpul|lengkap|siap|diambil|disebar)|belum\s*(?:ada|punya|lengkap|diambil|disebar)|sedang\s*(?:dikumpulkan|disebar|diambil)|excel|spss|csv|dataset)\b/i.test(lower);

  if (!hasSourceOrInstrument && !hasSampleSize && !hasCollectionStatus) {
    return {
      valid: false,
      feedback:
        "Keterangan tersebut belum memuat karakteristik data statistik yang valid. Untuk menentukan uji yang tepat (seperti uji asumsi klasik atau uji validitas instrumen), analis perlu mengetahui: (1) sumber data (misal: kuesioner Likert atau laporan keuangan), (2) jumlah sampel, dan (3) status pengumpulan data. Mohon jelaskan profil datamu.",
    };
  }

  return { valid: true };
}

/**
 * Validates statistical method names or keywords.
 */
export function validateMethod(text: string): { valid: boolean; feedback?: string } {
  const generalErr = checkGeneralUncooperative(text);
  if (generalErr) return { valid: false, feedback: generalErr };

  const lower = text.trim().toLowerCase();
  const isMethodName =
    /\b(?:regresi|anova|t-?test|uji\s*t|korelasi|sem|pls|jalur|path|deskriptif|chi-?square|chi\s*kuadrat|mann|wilcoxon|kruskal|panel|logistik|probit|multilevel|faktor|cluster|discriminant|ancova|survival|arima|timeseries|non-?parametrik|parametrik)\b/i.test(lower);

  if (!isMethodName) {
    return {
      valid: false,
      feedback:
        "Metode analisis yang kamu masukkan tidak dikenali dalam metodologi statistik. Mohon sebutkan nama metode yang sah sesuai arahan pembimbingmu (contoh: *Regresi Linear Berganda*, *Uji Mann-Whitney*, *ANOVA*, atau *PLS-SEM*).",
    };
  }

  return { valid: true };
}

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
    const wantsFallback = /ikut|sesuai|sama|dari\s*tujuan/i.test(clean);
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
/* Turn runner with Strict Academic Validation                         */
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
      const val = validateObjective(text);
      if (!val.valid) {
        return {
          reply: val.feedback ?? "Tujuan penelitian tidak valid. Mohon berikan rumusan tujuan penelitian yang jelas.",
          awaiting: "objective",
          brief, // CRITICAL: do not extract garbage into brief
          suggestions: OPENING_TURN.suggestions,
          suggestionMode: "fill",
        };
      }

      const lead = /pengaruh|dampak|faktor/i.test(text)
        ? "Tujuan sebab-akibat tercatat."
        : /perbedaan|beda|membandingkan/i.test(text)
          ? "Tujuan komparasi antar kelompok tercatat."
          : /hubungan|korelasi/i.test(text)
            ? "Tujuan analisis korelasi tercatat."
            : "Tujuan penelitian tercatat.";

      const next = keep({ objective: text });
      const derived = variablesFromObjective(text);
      return {
        reply: `${lead}\n\nSekarang tahap kedua: **sebutkan variabel bebas (X) dan variabel terikat (Y)** dalam penelitianmu.`,
        awaiting: "variables",
        brief: next,
        suggestions: derived
          ? [
              `Variabel bebas: ${derived.independent.join(", ")}. Variabel terikat: ${derived.dependent.join(", ")}.`,
              "Ikuti dari tujuan penelitian di atas",
            ]
          : [
              "Variabel bebas: motivasi belajar, disiplin. Variabel terikat: prestasi akademik.",
              "Ikuti dari tujuan penelitian di atas",
            ],
        suggestionMode: "fill",
      };
    }

    case "variables": {
      const val = validateVariables(text, brief.objective);
      if (!val.valid) {
        return {
          reply: val.feedback ?? "Variabel penelitian tidak valid. Mohon sebutkan variabel bebas dan terikat.",
          awaiting: "variables",
          brief, // CRITICAL: do not extract garbage into brief
          suggestions: [
            "Variabel bebas: kualitas layanan, harga. Variabel terikat: kepuasan pelanggan.",
            "Ikuti dari tujuan penelitian di atas",
          ],
          suggestionMode: "fill",
        };
      }

      const variables = parseVariables(text, brief.objective);
      return {
        reply: `${describeVariables(variables)}\n\nSekarang tahap ketiga mengenai profil data: **jelaskan sumber datamu** (primer kuesioner atau sekunder), **estimasi jumlah sampel**, dan **apakah data sudah terkumpul.**`,
        awaiting: "dataProfile",
        brief: keep({ variables }),
        suggestions: [
          "Data primer dari kuesioner skala Likert, 120 responden, sudah terkumpul.",
          "Data sekunder laporan keuangan 30 perusahaan selama 5 tahun (panel).",
        ],
        suggestionMode: "fill",
      };
    }

    case "dataProfile": {
      const val = validateDataProfile(text);
      if (!val.valid) {
        return {
          reply: val.feedback ?? "Profil data tidak valid. Mohon jelaskan sumber data dan jumlah sampelmu.",
          awaiting: "dataProfile",
          brief, // CRITICAL: do not extract garbage into brief
          suggestions: [
            "Data primer dari kuesioner skala Likert, 120 responden, sudah terkumpul.",
            "Data sekunder laporan keuangan 30 perusahaan selama 5 tahun (panel).",
          ],
          suggestionMode: "fill",
        };
      }

      const next = keep({ dataProfile: text });
      const rec = recommendMethod(next, text);
      return {
        reply: `Berdasarkan tujuan, variabel, dan profil datamu, saya sarankan **${rec.method}**.\n\nAlasan metodologis:\n${bullets(rec.reasons)}\n\nUji asumsi & validitas yang akan dilakukan analis:\n${bullets(rec.checks)}\n\n**Apakah metode ini sesuai dengan instruksi dosen pembimbingmu?**`,
        awaiting: "confirm",
        brief: { ...next, method: rec.method },
        suggestions: ["Ya, sesuai.", "Dosen saya meminta metode lain."],
        suggestionMode: "send",
      };
    }

    case "confirm": {
      const generalErr = checkGeneralUncooperative(text);
      if (generalErr) {
        return {
          reply: `${generalErr}\n\nMohon konfirmasi dengan jelas: apakah kamu menyetujui rekomendasi metode di atas (**'Ya, sesuai'**), atau dosenmu meminta metode lain?`,
          awaiting: "confirm",
          brief, // CRITICAL: do not proceed
          suggestions: ["Ya, sesuai.", "Dosen saya meminta metode lain."],
          suggestionMode: "send",
        };
      }

      const declines =
        /^(?:tidak|bukan|beda|ganti|lain)\b/i.test(text) ||
        /\b(?:dosen.*(?:minta|meminta|lain)|metode\s*lain|belum\s*sesuai|tidak\s*sesuai)\b/i.test(text);

      if (declines) {
        return {
          reply: "Baik. **Tuliskan nama metode statistik yang diinstruksikan oleh dosen pembimbingmu** (misalnya *Regresi Data Panel*, *Uji Mann-Whitney*, atau *ANOVA*).",
          awaiting: "method",
          brief,
          suggestions: ["Regresi data panel", "Uji Mann-Whitney", "ANOVA satu arah"],
          suggestionMode: "fill",
        };
      }

      const accepts = /^(?:ya|iya|oke|ok|setuju|sesuai|lanjut|betul|benar|cocok|bisa)\b/i.test(text);
      const namesMethod = /regresi|anova|t-?test|uji\s*t|korelasi|\bsem\b|\bpls\b|deskriptif|chi-?square|mann|wilcoxon|panel|logistik/i.test(text);

      if (!accepts && namesMethod) {
        return finish(keep({ method: text }), "Metode spesifik dari dosenmu telah dicatat; analis akan mengikutinya.");
      }

      if (accepts) {
        return finish(brief, "Metode rekomendasi disepakati.");
      }

      return {
        reply: "Mohon konfirmasi yang jelas: ketik **'Ya, sesuai'** jika menyetujui, atau tulis nama metode yang diminta dosenmu.",
        awaiting: "confirm",
        brief,
        suggestions: ["Ya, sesuai.", "Dosen saya meminta metode lain."],
        suggestionMode: "send",
      };
    }

    case "method": {
      const val = validateMethod(text);
      if (!val.valid) {
        return {
          reply: val.feedback ?? "Nama metode tidak valid. Mohon sebutkan metode statistik yang sah.",
          awaiting: "method",
          brief, // CRITICAL: do not extract garbage into brief
          suggestions: ["Regresi linear berganda", "Regresi data panel", "Uji Mann-Whitney"],
          suggestionMode: "fill",
        };
      }

      return finish(keep({ method: text }), "Metode dari dosenmu telah dicatat; analis akan mengikutinya.");
    }

    case "done":
    default: {
      const generalErr = checkGeneralUncooperative(text);
      if (generalErr) {
        return {
          reply: "Brief metodologimu sudah lengkap dan valid. Kamu dapat langsung meninjau ringkasan di panel samping dan menekan tombol **'Kirim Brief & Buat Pesanan'**.",
          awaiting: "done",
          brief,
          suggestions: [],
          suggestionMode: "fill",
        };
      }

      const note = clip(`${brief.dataProfile ?? ""} [Catatan tambahan: ${text}]`, 900);
      return {
        reply: "Catatan tambahan telah disimpan ke dalam brief. Silakan lanjutkan dengan mengirimkan brief melalui tombol konfirmasi.",
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
    reply: `${lead}\n\nBrief metodologi telah lengkap dan tervalidasi secara akademik. **Periksa ringkasan di samping dan lanjutkan untuk mengirimkan pesanan.**`,
    awaiting: "done",
    brief,
    suggestions: [],
    suggestionMode: "fill",
  };
}

export function countFilled(brief: ResearchBrief): number {
  return [brief.objective, brief.variables, brief.dataProfile, brief.method].filter(Boolean).length;
}
