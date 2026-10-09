export function TrustBar() {
  const stats = [
    { label: "Riset & Skripsi Selesai", value: "480+" },
    { label: "Pilihan Software Olah Data", value: "SPSS / R / Stata / PLS" },
    { label: "Reproducibility Syntax", value: "100%" },
    { label: "Rerata Waktu Pengerjaan", value: "2–4 Hari Kerja" },
  ];

  return (
    <section className="w-full border-y border-border bg-surface py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="text-center sm:text-left">
              <div className="font-mono text-xl sm:text-2xl font-bold text-ink">
                {item.value}
              </div>
              <div className="mt-1 text-caption text-ink-muted">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
