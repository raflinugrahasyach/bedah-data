import Link from "next/link";
import { ArrowRight, ChatCircleDots, Receipt, PhoneCall, GearSix, FolderSimpleStar } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export function Workflow() {
  const steps = [
    {
      num: "01",
      icon: ChatCircleDots,
      title: "Konsultasi & Brief Metodologi",
      desc: "Isi tujuan penelitian, variabel X dan Y, serta profil data mentahmu melalui asisten konsultasi kami. Dapatkan rekomendasi metode uji yang tepat.",
    },
    {
      num: "02",
      icon: Receipt,
      title: "Estimasi & Konfirmasi Pesanan",
      desc: "Sistem menghitung biaya transparan sesuai metode analisis yang dibutuhkan. Konfirmasi pesanan secara instan melalui pembayaran digital.",
    },
    {
      num: "03",
      icon: PhoneCall,
      title: "15-Minute Sync Call",
      desc: "Jadwalkan panggilan konsultasi singkat bersama analis untuk menyamakan persepsi hipotesis, tabulasi instrumen, dan arahan dosen pembimbing.",
    },
    {
      num: "04",
      icon: GearSix,
      title: "Pengolahan & Quality Control",
      desc: "Analis membersihkan data, menulis script syntax, menjalankan uji statistik, dan memeriksa kepatuhan asumsi klasik secara teliti.",
    },
    {
      num: "05",
      icon: FolderSimpleStar,
      title: "Penyerahan Berkas Lengkap",
      desc: "Terima paket deliverable lengkap: dataset bersih (.sav/.xlsx), syntax skrip yang dapat di-run ulang, serta laporan interpretasi siap pakai.",
    },
  ];

  return (
    <section id="alur-kerja" className="w-full py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-border">
      <div className="max-w-3xl mb-12">
        <div className="text-caption font-mono text-primary font-semibold uppercase tracking-wider mb-2">
          Alur Layanan Terstandar
        </div>
        <h2 className="text-h2 font-semibold text-ink">
          Alur 5 Tahap: Transparan dari brief awal hingga berkas akhir.
        </h2>
        <p className="mt-3 text-body text-ink-muted">
          Kami menstandardisasi setiap langkah pengolahan agar proses akuntabel dan mahasiswa memahami setiap uji yang dilakukan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="rounded-card border border-border bg-surface p-5 flex flex-col justify-between hover:border-border-strong transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm font-bold text-primary">{step.num}</span>
                  <div className="size-8 rounded-control bg-field border border-border flex items-center justify-center text-ink-muted">
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-body font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-caption text-ink-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-card border border-border bg-field p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-body font-semibold text-ink">Siap mulai tahap pertama sekarang?</h4>
          <p className="text-body-sm text-ink-muted">Konsultasi interaktif gratis hanya memerlukan 3–5 menit.</p>
        </div>
        <Button asChild variant="primary">
          <Link href="/konsultasi">
            <span>Mulai Konsultasi Tahap 1</span>
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    </section>
  );
}
