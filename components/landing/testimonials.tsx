export function Testimonials() {
  const reviews = [
    {
      name: "Rizky Firmansyah",
      role: "Mahasiswa S1 Manajemen Bisnis",
      campus: "Universitas Padjadjaran",
      method: "Regresi Linear Berganda",
      quote:
        "Dosen penguji saya minta demonstrasi SPSS saat sidang skripsi. Beruntung saya dapat file syntax lengkap dari Bedah Data, jadi saya bisa run ulang langsung di laptop tanpa grogi.",
    },
    {
      name: "Annisa Larasati",
      role: "Mahasiswi Magister Ilmu Komunikasi",
      campus: "Universitas Indonesia",
      method: "PLS-SEM & Mediasi",
      quote:
        "Model mediasi saya sempat membingungkan karena nilai p-value bootstrapping tipis. Analis di sesi call 15 menit menjelaskan logika perantara dengan bahasa yang mudah saya pertahankan di depan pembimbing.",
    },
    {
      name: "Budi Prakoso",
      role: "Peneliti Muda Agribisnis",
      campus: "Institut Pertanian Bogor",
      method: "ANOVA & Post-Hoc Test",
      quote:
        "Bukan sekadar terima tabel jadi. Format data .xlsx dan syntax script R-nya sangat rapi dan memenuhi kaidah keterbukaan data penelitian yang dipersyaratkan jurnal.",
    },
  ];

  return (
    <section className="w-full py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-border">
      <div className="max-w-3xl mb-12">
        <div className="text-caption font-mono text-primary font-semibold uppercase tracking-wider mb-2">
          Ulasan Mahasiswa & Peneliti
        </div>
        <h2 className="text-h2 font-semibold text-ink">
          Dipercaya oleh mahasiswa yang mengutamakan akuntabilitas ilmiah.
        </h2>
        <p className="mt-3 text-body text-ink-muted">
          Berikut pengalaman mahasiswa yang menyelesaikan analisis skripsi dan tesis mereka bersama Bedah Data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="rounded-card border border-border bg-surface p-6 flex flex-col justify-between"
          >
            <div>
              <div className="inline-block rounded-control bg-field border border-border px-2 py-0.5 text-caption font-mono text-ink-muted mb-4">
                {rev.method}
              </div>
              <p className="text-body-sm text-ink leading-relaxed">
                "{rev.quote}"
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="font-semibold text-body-sm text-ink">{rev.name}</div>
              <div className="text-caption text-ink-muted">{rev.role}</div>
              <div className="text-caption text-primary font-medium">{rev.campus}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
