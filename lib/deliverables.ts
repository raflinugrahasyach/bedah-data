import type { AnalystStatus, DeliverableKind, OrderStatus, PaymentStatus } from "@/lib/types";

export interface DeliverableSpec {
  kind: DeliverableKind;
  label: string;
  description: string;
  extensions: string[];
}

/** Shared by the upload UI and the API so the accepted file types cannot diverge. */
export const DELIVERABLE_SPECS: DeliverableSpec[] = [
  {
    kind: "cleaned_data",
    label: "Data bersih",
    description: "Dataset yang sudah dibersihkan dan diberi label variabel.",
    extensions: [".sav", ".xlsx", ".xls", ".csv", ".dta"],
  },
  {
    kind: "syntax",
    label: "Syntax",
    description: "Skrip analisis supaya seluruh langkah bisa dijalankan ulang.",
    extensions: [".sps", ".r", ".rmd", ".do", ".py", ".txt"],
  },
  {
    kind: "report",
    label: "Laporan PDF",
    description: "Tabel hasil uji, interpretasi, dan kesimpulan.",
    extensions: [".pdf"],
  },
];

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function getSpec(kind: DeliverableKind): DeliverableSpec {
  const spec = DELIVERABLE_SPECS.find((item) => item.kind === kind);
  if (!spec) throw new Error(`Unknown deliverable kind: ${kind}`);
  return spec;
}

export function validateUpload(kind: DeliverableKind, name: string, size: number): string | null {
  const spec = getSpec(kind);
  const lower = name.toLowerCase();
  if (!spec.extensions.some((ext) => lower.endsWith(ext))) {
    return `Format berkas tidak sesuai. Untuk ${spec.label.toLowerCase()} gunakan ${spec.extensions.join(", ")}.`;
  }
  if (size <= 0) return "Berkas kosong.";
  if (size > MAX_UPLOAD_BYTES) return "Ukuran berkas melebihi 25 MB.";
  return null;
}

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; hint: string }> = {
  pending: { label: "Pending", hint: "Menunggu pembayaran atau dimulai analis" },
  in_progress: { label: "In Progress", hint: "Analis sedang mengerjakan" },
  qc: { label: "QC", hint: "Hasil sedang diperiksa ulang" },
  delivered: { label: "Delivered", hint: "Berkas sudah terkirim ke klien" },
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Belum dibayar",
  paid: "Lunas",
  refunded: "Dikembalikan",
};

export const ANALYST_STATUS_LABEL: Record<AnalystStatus, string> = {
  not_started: "Belum dimulai",
  in_progress: "Dikerjakan",
  ready_for_qc: "Siap QC",
  approved: "Disetujui QC",
};
