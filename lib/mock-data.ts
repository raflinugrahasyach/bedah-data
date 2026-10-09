import type { BriefVariables, Deliverable, DeliverableKind, OrderRecord } from "@/lib/types";

/**
 * Demonstration orders for the admin dashboard. All names, emails, and topics
 * are invented sample data; nothing here refers to real people.
 */

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const file = (kind: DeliverableKind, name: string, size: number, hours: number): Deliverable => ({
  kind,
  name,
  size,
  uploadedAt: hoursAgo(hours),
});

const vars = (summary: string, independent: string[], dependent: string[]): BriefVariables => ({
  summary,
  independent,
  dependent,
});

export function seedOrders(): OrderRecord[] {
  return [
    {
      id: "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e01",
      code: "BD-1042",
      status: "pending",
      paymentStatus: "unpaid",
      totalPrice: 575_000,
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(3),
      client: { id: "c-aulia", name: "Aulia Rahma", email: "aulia.rahma@contoh.ac.id" },
      brief: {
        objective: "Pengaruh kualitas layanan dan harga terhadap kepuasan pelanggan",
        variables: vars("Bebas: kualitas layanan, harga. Terikat: kepuasan pelanggan.", ["kualitas layanan", "harga"], ["kepuasan pelanggan"]),
        dataProfile: "Data primer kuesioner skala Likert, 120 responden, sudah terkumpul tapi belum dibersihkan.",
        method: "Regresi linear berganda",
      },
      workItem: { id: "w-1042", analystStatus: "not_started", deliverables: [] },
      activity: [{ at: hoursAgo(3), text: "Brief diterima dari chatbot konsultasi." }],
    },
    {
      id: "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e02",
      code: "BD-1041",
      status: "pending",
      paymentStatus: "paid",
      totalPrice: 350_000,
      createdAt: hoursAgo(20),
      updatedAt: hoursAgo(6),
      client: { id: "c-bagas", name: "Bagas Pratama", email: "bagas.pratama@contoh.ac.id" },
      brief: {
        objective: "Perbedaan nilai ujian antara siswa yang belajar daring dan tatap muka",
        variables: vars("Bebas: model belajar. Terikat: nilai ujian.", ["model belajar"], ["nilai ujian"]),
        dataProfile: "Data sekunder nilai 64 siswa dari dua kelas, sudah ada dalam Excel.",
        method: "Uji t sampel independen (independent t-test)",
      },
      workItem: { id: "w-1041", analystStatus: "not_started", deliverables: [] },
      activity: [
        { at: hoursAgo(20), text: "Brief diterima dari chatbot konsultasi." },
        { at: hoursAgo(6), text: "Pembayaran dikonfirmasi (simulasi Midtrans)." },
      ],
    },
    {
      id: "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e03",
      code: "BD-1038",
      status: "in_progress",
      paymentStatus: "paid",
      totalPrice: 575_000,
      createdAt: hoursAgo(52),
      updatedAt: hoursAgo(5),
      client: { id: "c-citra", name: "Citra Maharani", email: "citra.maharani@contoh.ac.id" },
      brief: {
        objective: "Pengaruh motivasi belajar dan disiplin terhadap prestasi akademik mahasiswa",
        variables: vars("Bebas: motivasi belajar, disiplin. Terikat: prestasi akademik.", ["motivasi belajar", "disiplin"], ["prestasi akademik"]),
        dataProfile: "Data primer kuesioner skala Likert, 150 responden mahasiswa.",
        method: "Regresi linear berganda",
      },
      workItem: {
        id: "w-1038",
        analystStatus: "in_progress",
        deliverables: [file("cleaned_data", "data_bersih_citra.sav", 412_000, 5)],
      },
      activity: [
        { at: hoursAgo(52), text: "Brief diterima dari chatbot konsultasi." },
        { at: hoursAgo(48), text: "Pembayaran dikonfirmasi (simulasi Midtrans)." },
        { at: hoursAgo(30), text: "Status dipindah ke In Progress." },
        { at: hoursAgo(5), text: "Berkas Data bersih diunggah: data_bersih_citra.sav" },
      ],
    },
    {
      id: "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e04",
      code: "BD-1036",
      status: "in_progress",
      paymentStatus: "paid",
      totalPrice: 975_000,
      createdAt: hoursAgo(75),
      updatedAt: hoursAgo(26),
      client: { id: "c-dimas", name: "Dimas Anggara", email: "dimas.anggara@contoh.ac.id" },
      brief: {
        objective: "Pengaruh leverage terhadap nilai perusahaan dengan mediasi profitabilitas",
        variables: vars("Bebas: leverage. Mediasi: profitabilitas. Terikat: nilai perusahaan.", ["leverage"], ["nilai perusahaan"]),
        dataProfile: "Data sekunder laporan keuangan 30 perusahaan selama 5 tahun (panel).",
        method: "PLS-SEM (analisis jalur dengan mediasi atau moderasi)",
      },
      workItem: { id: "w-1036", analystStatus: "in_progress", deliverables: [] },
      activity: [
        { at: hoursAgo(75), text: "Brief diterima dari chatbot konsultasi." },
        { at: hoursAgo(70), text: "Pembayaran dikonfirmasi (simulasi Midtrans)." },
        { at: hoursAgo(26), text: "Status dipindah ke In Progress." },
      ],
    },
    {
      id: "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e05",
      code: "BD-1033",
      status: "qc",
      paymentStatus: "paid",
      totalPrice: 425_000,
      createdAt: hoursAgo(120),
      updatedAt: hoursAgo(9),
      client: { id: "c-eka", name: "Eka Wulandari", email: "eka.wulandari@contoh.ac.id" },
      brief: {
        objective: "Hubungan antara stres kerja dan kinerja karyawan",
        variables: vars("Bebas: stres kerja. Terikat: kinerja karyawan.", ["stres kerja"], ["kinerja karyawan"]),
        dataProfile: "Data primer kuesioner skala Likert, 85 responden karyawan.",
        method: "Korelasi Pearson (atau Spearman bila data tidak normal)",
      },
      workItem: {
        id: "w-1033",
        analystStatus: "ready_for_qc",
        deliverables: [
          file("cleaned_data", "data_bersih_eka.xlsx", 238_000, 14),
          file("syntax", "syntax_korelasi_eka.R", 6_400, 12),
        ],
      },
      activity: [
        { at: hoursAgo(120), text: "Brief diterima dari chatbot konsultasi." },
        { at: hoursAgo(115), text: "Pembayaran dikonfirmasi (simulasi Midtrans)." },
        { at: hoursAgo(96), text: "Status dipindah ke In Progress." },
        { at: hoursAgo(14), text: "Berkas Data bersih diunggah: data_bersih_eka.xlsx" },
        { at: hoursAgo(12), text: "Berkas Syntax diunggah: syntax_korelasi_eka.R" },
        { at: hoursAgo(9), text: "Status dipindah ke QC." },
      ],
    },
    {
      id: "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e06",
      code: "BD-1029",
      status: "delivered",
      paymentStatus: "paid",
      totalPrice: 250_000,
      createdAt: hoursAgo(240),
      updatedAt: hoursAgo(60),
      client: { id: "c-fajar", name: "Fajar Nugraha", email: "fajar.nugraha@contoh.ac.id" },
      brief: {
        objective: "Gambaran persepsi mahasiswa terhadap layanan perpustakaan kampus",
        variables: vars("Persepsi layanan perpustakaan.", [], []),
        dataProfile: "Data primer survei 200 responden.",
        method: "Statistik deskriptif (frekuensi, rata-rata, sebaran)",
      },
      workItem: {
        id: "w-1029",
        analystStatus: "approved",
        deliverables: [
          file("cleaned_data", "data_bersih_fajar.csv", 91_000, 100),
          file("syntax", "syntax_deskriptif_fajar.sps", 3_900, 98),
          file("report", "laporan_fajar.pdf", 1_240_000, 62),
        ],
      },
      activity: [
        { at: hoursAgo(240), text: "Brief diterima dari chatbot konsultasi." },
        { at: hoursAgo(236), text: "Pembayaran dikonfirmasi (simulasi Midtrans)." },
        { at: hoursAgo(200), text: "Status dipindah ke In Progress." },
        { at: hoursAgo(70), text: "Status dipindah ke QC." },
        { at: hoursAgo(60), text: "Status dipindah ke Delivered. Notifikasi n8n terkirim (simulasi)." },
      ],
    },
  ];
}
