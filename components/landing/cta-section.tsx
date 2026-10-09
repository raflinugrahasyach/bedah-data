import Link from "next/link";
import { ArrowRight, ChatCircleText } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="w-full py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-border">
      <div className="rounded-card border border-border bg-surface p-8 md:p-12 text-center max-w-4xl mx-auto shadow-card">
        <div className="text-caption font-mono text-primary font-semibold uppercase tracking-wider mb-3">
          Langkah Awal Riset
        </div>
        <h2 className="text-h2 font-semibold text-ink max-w-2xl mx-auto">
          Mulai dari konsultasi tujuan dan variabel penelitianmu hari ini.
        </h2>
        <p className="mt-4 text-body text-ink-muted max-w-xl mx-auto">
          Asisten metodologi kami akan memandu pemetaan variabel secara interaktif dan memberikan rekomendasi metode analisis yang tepat sebelum kamu memesan.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" variant="primary">
            <Link href="/konsultasi">
              <ChatCircleText size={18} />
              <span>Mulai Konsultasi</span>
            </Link>
          </Button>

          <Button asChild size="lg" variant="secondary">
            <Link href="/admin">
              <span>Buka Pipeline Pesanan</span>
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
