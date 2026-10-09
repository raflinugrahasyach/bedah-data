import Link from "next/link";
import {
  Kanban,
  Files,
  ArrowSquareOut,
  House,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh bg-bg text-ink">
      {/* Fixed solid sidebar (240px, 1px border-right, no floating shell per no-slop-ui) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-surface md:flex md:flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
            <span className="flex size-7 items-center justify-center rounded-control bg-primary text-on-primary font-mono text-xs font-bold">
              BD
            </span>
            <div className="flex flex-col">
              <span className="text-body-sm font-semibold text-ink leading-tight">
                Bedah Data
              </span>
              <span className="text-[11px] font-mono text-ink-muted leading-tight">
                Analis & QC Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1" aria-label="Menu Admin">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-control bg-primary-tint/60 px-3 py-2 text-body-sm font-medium text-primary-ink transition-colors hover:bg-primary-tint"
            >
              <Kanban size={18} />
              <span>Pipeline Pesanan</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 rounded-control px-3 py-2 text-body-sm font-medium text-ink-muted transition-colors hover:bg-border/50 hover:text-ink"
            >
              <House size={18} />
              <span>Lihat Website Publik</span>
              <ArrowSquareOut size={14} className="ml-auto opacity-70" />
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 text-caption text-ink-muted">
            <ShieldCheck size={16} className="text-primary" />
            <span>Mode Mock Analis Aktif</span>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted leading-relaxed">
            Data tersimpan di memori runtime. Siap dihubungkan ke Supabase.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-60">
        {/* Top bar for mobile and quick info */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 sm:px-6 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 md:hidden">
              <span className="flex size-7 items-center justify-center rounded-control bg-primary text-on-primary font-mono text-xs font-bold">
                BD
              </span>
              <span className="text-body-sm font-semibold text-ink">Bedah Data</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-caption font-mono text-ink-muted">
              <span>INTERNAL</span>
              <span>/</span>
              <span className="text-ink font-medium">PIPELINE ANALISIS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/konsultasi"
              className="rounded-control border border-border bg-field px-2.5 py-1 text-caption font-medium text-ink hover:bg-primary-tint transition-colors"
            >
              + Buat Order Baru
            </Link>
          </div>
        </header>

        {/* Main page content container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
