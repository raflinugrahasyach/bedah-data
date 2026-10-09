import Link from "next/link";
import { Check, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { PRICING_TIERS, INSTRUMENT_TEST_FEE } from "@/lib/pricing";
import { formatRupiah } from "@/lib/utils";

export function Pricing() {
  const commonFeatures = [
    "Pembersihan data mentah & coding variabel",
    "File Syntax lengkap (.sps / .R / .do)",
    "Laporan ringkas tabel uji & interpretasi PDF",
    "Sesi sync call 15 menit bersama analis",
    "Garansi revisi teknis metodologi 14 hari",
  ];

  return (
    <section id="biaya" className="w-full py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-border">
      <div className="max-w-3xl mb-12">
        <div className="text-caption font-mono text-primary font-semibold uppercase tracking-wider mb-2">
          Struktur Biaya
        </div>
        <h2 className="text-h2 font-semibold text-ink">
          Biaya tetap dan transparan berdasarkan metode analisis.
        </h2>
        <p className="mt-3 text-body text-ink-muted">
          Tidak ada biaya tersembunyi. Biaya dihitung langsung saat kamu menyelesaikan brief metodologi di Tahap 1.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.family}
            className="rounded-card border border-border bg-surface p-6 flex flex-col justify-between hover:border-border-strong transition-colors"
          >
            <div>
              <div className="text-body-sm font-semibold text-ink">{tier.label}</div>
              <p className="mt-1 text-caption text-ink-muted min-h-8">{tier.examples}</p>

              <div className="mt-6 mb-6">
                <span className="text-caption text-ink-muted block">Mulai dari</span>
                <div className="font-mono text-2xl font-bold text-ink">
                  {formatRupiah(tier.from)}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <ul className="space-y-2 text-caption text-ink-muted">
                  {commonFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={14} className="text-success shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Button asChild variant="secondary" className="w-full">
                <Link href="/konsultasi">
                  <span>Pilih Paket</span>
                  <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-card border border-border bg-field p-4 text-caption text-ink-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span>
          * Catatan: Data kuesioner skala Likert yang memerlukan uji validitas & reliabilitas instrumen dikenakan biaya tambahan {formatRupiah(INSTRUMENT_TEST_FEE)}.
        </span>
        <span className="font-mono text-ink font-medium shrink-0">Metode Pembayaran: QRIS & Transfer Bank</span>
      </div>
    </section>
  );
}
