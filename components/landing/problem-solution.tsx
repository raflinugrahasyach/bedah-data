import { XCircle, CheckCircle } from "@phosphor-icons/react/dist/ssr";

export function ProblemSolution() {
  const problems = [
    "Hasil uji statistik tidak signifikan atau melanggar asumsi klasik tanpa solusi ilmiah.",
    "Menggunakan jasa olah data liar yang hanya memberi screenshot output tanpa syntax.",
    "Panik saat dosen pembimbing meminta mahasiswa menjalankan ulang analisis secara langsung di ruang sidang.",
    "Kekhawatiran manipulasi data yang melanggar etika dan berisiko pembatalan gelar.",
  ];

  const solutions = [
    "Pembersihan data metodologis: perlakuan outlier, transformasi data, dan mitigasi asumsi yang sah.",
    "Syntax transparan dan terdokumentasi rapi (.sps, .R, .do) sehingga dapat di-run ulang 100%.",
    "Pendampingan call 15 menit agar kamu memahami logika di balik angka, hipotesis, dan kesimpulan.",
    "Integritas penuh: perbaikan dilakukan melalui teknik statistik resmi tanpa fabrikasi angka fiktif.",
  ];

  return (
    <section className="w-full py-16 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-h2 font-semibold text-ink">
          Masalah olah data skripsi bukan sekadar angka, tapi pemahaman metodologi.
        </h2>
        <p className="mt-3 text-body text-ink-muted">
          Banyak mahasiswa terhambat bukan karena datanya buruk, tetapi karena tidak memiliki syntax yang bisa diverifikasi saat dosen meminta pembuktian.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Problem */}
        <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex size-7 items-center justify-center rounded-control bg-danger-tint text-danger font-bold text-xs">
              01
            </span>
            <h3 className="text-h3 font-semibold text-danger">Kendala yang Sering Dihadapi</h3>
          </div>
          <ul className="space-y-4">
            {problems.map((text, idx) => (
              <li key={idx} className="flex items-start gap-3 text-body-sm text-ink-muted">
                <XCircle size={18} className="text-danger shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The Solution */}
        <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex size-7 items-center justify-center rounded-control bg-success-tint text-success font-bold text-xs">
              02
            </span>
            <h3 className="text-h3 font-semibold text-success">Pendekatan Bedah Data</h3>
          </div>
          <ul className="space-y-4">
            {solutions.map((text, idx) => (
              <li key={idx} className="flex items-start gap-3 text-body-sm text-ink">
                <CheckCircle size={18} className="text-success shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
