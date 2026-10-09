import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-control bg-primary text-on-primary font-mono text-xs font-bold">
                BD
              </span>
              <span className="text-body font-semibold text-ink">Bedah Data</span>
            </div>
            <p className="max-w-md text-body-sm text-ink-muted">
              Layanan olah data dan pendampingan metodologi akademik. Kami membantu mahasiswa dan peneliti memahami struktur data, syntax analisis yang valid, dan interpretasi hasil yang akuntabel.
            </p>
            <p className="text-caption text-ink-muted">
              Komitmen integritas akademik: Bedah Data menyediakan pendampingan analisis dan syntax reproduksibel, bukan joki penulisan naskah.
            </p>
          </div>

          <div>
            <h3 className="text-body-sm font-semibold text-ink mb-3">Navigasi</h3>
            <ul className="space-y-2 text-body-sm text-ink-muted">
              <li>
                <Link href="/#layanan" className="hover:text-primary transition-colors">
                  Layanan Analisis
                </Link>
              </li>
              <li>
                <Link href="/#alur-kerja" className="hover:text-primary transition-colors">
                  Alur 5 Tahap
                </Link>
              </li>
              <li>
                <Link href="/#biaya" className="hover:text-primary transition-colors">
                  Struktur Biaya
                </Link>
              </li>
              <li>
                <Link href="/konsultasi" className="hover:text-primary transition-colors">
                  Konsultasi Metodologi
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Internal Pipeline
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-body-sm font-semibold text-ink mb-3">Platform & Format</h3>
            <ul className="space-y-2 text-body-sm text-ink-muted">
              <li>SPSS Statistics (.sav, .sps)</li>
              <li>R & RMarkdown (.R, .Rmd)</li>
              <li>Stata (.dta, .do)</li>
              <li>SmartPLS / PLS-SEM</li>
              <li>Laporan Tabular PDF</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-caption text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Bedah Data. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-6">
            <span>Standar Metodologi Akademik</span>
            <span>Kerahasiaan Data Terjamin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
