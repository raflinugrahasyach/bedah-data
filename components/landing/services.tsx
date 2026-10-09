import { Table, ChartBar, Graph, TreeStructure } from "@phosphor-icons/react/dist/ssr";

export function Services() {
  const services = [
    {
      icon: Table,
      title: "Statistik Deskriptif & Instrumen",
      description:
        "Eksplorasi profil responden, tendensi sentral, uji validitas instrumen (pearson product moment) dan uji reliabilitas Cronbach's Alpha.",
      deliverables: ["Tabel ringkasan deskriptif", "Tabel r-hitung vs r-tabel", "Rekap Cronbach Alpha"],
    },
    {
      icon: ChartBar,
      title: "Uji Komparasi & Korelasi",
      description:
        "Analisis perbedaan antar kelompok (Independent t-test, Paired t-test, ANOVA) atau kekuatan hubungan antar variabel dengan uji asumsi normalitas & homogenitas.",
      deliverables: ["Uji homogenitas Levene", "Uji beda signifikansi", "Matriks korelasi"],
    },
    {
      icon: Graph,
      title: "Regresi & Uji Asumsi Klasik",
      description:
        "Pemodelan regresi linear berganda lengkap dengan 4 uji asumsi klasik: normalitas residual, multikolinearitas (VIF), heteroskedastisitas (Glejser/Scatterplot), dan autokorelasi.",
      deliverables: ["Tabel ANOVA (uji F)", "Koefisien t-parsial & Sig", "Uji asumsi klasik lengkap"],
    },
    {
      icon: TreeStructure,
      title: "Pemodelan Lanjutan & Data Panel",
      description:
        "Analisis structural equation modeling berbasis partial least squares (PLS-SEM) dengan variabel mediasi/moderasi, atau regresi data panel (Chow & Hausman test).",
      deliverables: ["Outer & Inner model evaluation", "Uji hipotesis bootstrapping", "Rekomendasi model panel terbaik"],
    },
  ];

  return (
    <section id="layanan" className="w-full py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-border">
      <div className="max-w-3xl mb-12">
        <div className="text-caption font-mono text-primary font-semibold uppercase tracking-wider mb-2">
          Cakupan Layanan
        </div>
        <h2 className="text-h2 font-semibold text-ink">
          Layanan analisis statistik yang disesuaikan dengan metodologi bab 3.
        </h2>
        <p className="mt-3 text-body text-ink-muted">
          Setiap paket pengerjaan mencakup perapian data mentah, penyusunan syntax, running uji statistik, dan pembuatan draft interpretasi hasil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-card border border-border bg-surface p-6 flex flex-col justify-between hover:border-border-strong transition-colors"
            >
              <div>
                <div className="size-10 rounded-control bg-primary-tint text-primary-ink flex items-center justify-center mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="text-h3 font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-body-sm text-ink-muted">{item.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <span className="text-caption font-medium text-ink block mb-2">Output yang diterima:</span>
                <ul className="space-y-1">
                  {item.deliverables.map((del, dIdx) => (
                    <li key={dIdx} className="text-caption text-ink-muted flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {del}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
