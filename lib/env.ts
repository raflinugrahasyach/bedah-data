/**
 * Central, typed access to environment configuration.
 * Anything that still starts with "mock" is treated as an offline stub so the
 * whole app stays demonstrable without real credentials.
 */

const isMockValue = (value: string | undefined) =>
  !value || value.toLowerCase().startsWith("mock") || value.includes("mock-");

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qmuuxlaamenbpqxouagu.supabase.co",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite",
  calcomLink:
    process.env.NEXT_PUBLIC_CALCOM_LINK ?? "https://cal.com/muhammad-rafli-nugrahasyach-wcctyc/konsultasi",
} as const;

export const isMock = {
  supabase: isMockValue(env.supabaseUrl) || isMockValue(env.supabaseAnonKey),
  gemini: isMockValue(process.env.GEMINI_API_KEY),
  midtrans: isMockValue(process.env.MIDTRANS_SERVER_KEY),
  n8n: isMockValue(process.env.N8N_WEBHOOK_URL),
  calcom: isMockValue(process.env.CALCOM_API_KEY),
};
