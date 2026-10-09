"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChartBarHorizontal, ChatCircleText } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/#layanan", label: "Layanan" },
    { href: "/#alur-kerja", label: "Alur Kerja" },
    { href: "/#biaya", label: "Biaya" },
    { href: "/admin", label: "Admin Pipeline", badge: "Internal" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-ink hover:text-primary transition-colors"
        >
          <span className="flex size-8 items-center justify-center rounded-control bg-primary text-on-primary font-mono text-sm font-bold">
            BD
          </span>
          <span className="text-body font-semibold">Bedah Data</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi Utama">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-body-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5",
                  isActive ? "text-primary font-semibold" : "text-ink-muted",
                )}
              >
                {link.label}
                {link.badge ? (
                  <span className="rounded-control bg-border/80 px-1.5 py-0.5 text-[10px] font-mono text-ink-muted">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex">
            <Link href="/admin">
              <ChartBarHorizontal size={16} />
              <span>Pipeline</span>
            </Link>
          </Button>

          <Button asChild size="sm" variant="primary">
            <Link href="/konsultasi">
              <ChatCircleText size={16} />
              <span>Mulai Konsultasi</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
