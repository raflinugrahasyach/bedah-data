/**
 * Mock price list (IDR). These are demonstration figures, not a real tariff;
 * the landing page and the order estimate both read from here so they cannot drift.
 */
export type MethodFamily = "descriptive" | "comparison" | "regression" | "advanced";

export interface PricingTier {
  family: MethodFamily;
  label: string;
  examples: string;
  from: number;
}

export const PRICING_TIERS: PricingTier[] = [
  { family: "descriptive", label: "Statistik deskriptif", examples: "Frekuensi, rata-rata, sebaran", from: 250_000 },
  { family: "comparison", label: "Uji beda dan korelasi", examples: "Uji t, ANOVA, Pearson, Spearman", from: 350_000 },
  { family: "regression", label: "Regresi", examples: "Sederhana, berganda, uji asumsi klasik", from: 500_000 },
  { family: "advanced", label: "Model lanjutan", examples: "Data panel, PLS-SEM, mediasi dan moderasi", from: 900_000 },
];

/** Added when the instrument is a Likert questionnaire (validity and reliability tests). */
export const INSTRUMENT_TEST_FEE = 75_000;

export function classifyMethod(method: string): MethodFamily {
  const text = method.toLowerCase();
  if (/pls|\bsem\b|mediasi|moderasi|panel|lanjutan|logistik|multilevel/.test(text)) return "advanced";
  if (/regresi/.test(text)) return "regression";
  if (/uji t|t-?test|anova|korelasi|pearson|spearman|mann|wilcoxon|chi|beda/.test(text)) return "comparison";
  return "descriptive";
}

export interface PriceEstimate {
  family: MethodFamily;
  base: number;
  instrumentFee: number;
  total: number;
}

export function estimatePrice(method: string, dataProfile: string): PriceEstimate {
  const family = classifyMethod(method);
  const base = PRICING_TIERS.find((tier) => tier.family === family)?.from ?? PRICING_TIERS[0].from;
  const instrumentFee = /likert|kuesioner|kuisioner|angket|skala/i.test(dataProfile) ? INSTRUMENT_TEST_FEE : 0;
  return { family, base, instrumentFee, total: base + instrumentFee };
}
