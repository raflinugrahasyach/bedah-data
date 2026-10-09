import Link from "next/link";
import { ArrowRight, FileCode, CheckCircle, ChatCircleText } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 py-12 md:py-16 min-h-[calc(100svh-4rem)] max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 rounded-control border border-border bg-field px-3 py-1 text-caption font-medium text-ink-muted mb-6">
        <span className="size-2 rounded-full bg-primary" aria-hidden />
        <span>LAYANAN PENGOLAHAN DATA RISET & SKRIPSI</span>
      </div>

      <h1 className="text-display font-semibold text-ink tracking-tight max-w-4xl mx-auto">
        Olah data penelitian dengan syntax yang dapat dipertanggungjawabkan.
      </h1>

      <p className="mt-5 text-body-lg text-ink-muted max-w-2xl mx-auto">
        Konsultasi metodologi terarah, pembersihan data mentah, skrip analisis siap replikasi, dan ringkasan interpretasi akademik.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" variant="primary">
          <Link href="/konsultasi">
            <ChatCircleText size={18} />
            <span>Mulai Konsultasi</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="#alur-kerja">
            <span>Lihat Alur Kerja</span>
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>

      {/* Deliverable preview card anchored in the hero view */}
      <div className="mt-10 w-full max-w-3xl rounded-card border border-border bg-surface p-4 text-left shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-caption text-ink-muted">
          <span className="font-mono font-medium text-ink">STANDAR DELIVERABLE BEDAH DATA</span>
          <span className="flex items-center gap-1.5 text-success font-medium">
            <CheckCircle size={14} className="text-success" /> Siap Uji Sidang
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-body-sm">
          <div className="rounded-control border border-border bg-field p-3">
            <div className="font-medium text-ink flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              1. Data Bersih
            </div>
            <p className="mt-1 text-caption text-ink-muted">
              Format .sav / .xlsx dengan label variabel, eliminasi outlier, dan coding rapi.
            </p>
          </div>
          <div className="rounded-control border border-border bg-field p-3">
            <div className="font-medium text-ink flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              2. Syntax Skrip
            </div>
            <p className="mt-1 text-caption text-ink-muted">
              Syntax .sps / .R / .do lengkap dengan baris instruksi agar dapat di-run ulang.
            </p>
          </div>
          <div className="rounded-control border border-border bg-field p-3">
            <div className="font-medium text-ink flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              3. Laporan Analisis
            </div>
            <p className="mt-1 text-caption text-ink-muted">
              PDF tabel uji hipotesis, evaluasi asumsi klasik, dan narasi interpretasi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
