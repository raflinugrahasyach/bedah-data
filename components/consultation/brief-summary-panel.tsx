"use client";

import { CheckCircle, CircleDashed, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { countFilled } from "@/lib/consultation";
import { estimatePrice } from "@/lib/pricing";
import { formatRupiah } from "@/lib/utils";
import type { ResearchBrief } from "@/lib/types";

interface BriefSummaryPanelProps {
  brief: ResearchBrief;
  onProceedToOrder: () => void;
}

export function BriefSummaryPanel({
  brief,
  onProceedToOrder,
}: BriefSummaryPanelProps) {
  const filledCount = countFilled(brief);
  const isComplete = filledCount === 4;

  const estimate =
    brief.method && brief.dataProfile
      ? estimatePrice(brief.method, brief.dataProfile)
      : null;

  return (
    <div className="flex flex-col h-full rounded-card border border-border bg-surface p-5">
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-body font-semibold text-ink">Ringkasan Brief Metodologi</h2>
          <span className="rounded-control bg-primary-tint px-2 py-0.5 font-mono text-caption font-semibold text-primary-ink">
            {filledCount}/4 Terisi
          </span>
        </div>
        <p className="mt-1 text-caption text-ink-muted">
          Data ini diekstrak otomatis oleh asisten untuk diteruskan ke analis.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4 text-body-sm">
        {/* Item 1: Tujuan */}
        <div className="rounded-control border border-border bg-field p-3">
          <div className="flex items-center gap-2 font-medium text-ink">
            {brief.objective ? (
              <CheckCircle size={16} className="text-success" />
            ) : (
              <CircleDashed size={16} className="text-ink-muted" />
            )}
            <span>1. Tujuan Penelitian</span>
          </div>
          <p className="mt-1.5 text-caption text-ink-muted">
            {brief.objective ? (
              <span className="text-ink font-normal">{brief.objective}</span>
            ) : (
              <span className="italic">Belum ditentukan</span>
            )}
          </p>
        </div>

        {/* Item 2: Variabel */}
        <div className="rounded-control border border-border bg-field p-3">
          <div className="flex items-center gap-2 font-medium text-ink">
            {brief.variables ? (
              <CheckCircle size={16} className="text-success" />
            ) : (
              <CircleDashed size={16} className="text-ink-muted" />
            )}
            <span>2. Variabel Penelitian</span>
          </div>
          {brief.variables ? (
            <div className="mt-2 space-y-1.5 text-caption">
              <div>
                <span className="text-ink-muted font-medium">Bebas (X): </span>
                <span className="text-ink">
                  {brief.variables.independent.length > 0
                    ? brief.variables.independent.join(", ")
                    : brief.variables.summary}
                </span>
              </div>
              <div>
                <span className="text-ink-muted font-medium">Terikat (Y): </span>
                <span className="text-ink">
                  {brief.variables.dependent.length > 0
                    ? brief.variables.dependent.join(", ")
                    : "-"}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-caption italic text-ink-muted">Belum ditentukan</p>
          )}
        </div>

        {/* Item 3: Profil Data */}
        <div className="rounded-control border border-border bg-field p-3">
          <div className="flex items-center gap-2 font-medium text-ink">
            {brief.dataProfile ? (
              <CheckCircle size={16} className="text-success" />
            ) : (
              <CircleDashed size={16} className="text-ink-muted" />
            )}
            <span>3. Profil & Sumber Data</span>
          </div>
          <p className="mt-1.5 text-caption text-ink-muted">
            {brief.dataProfile ? (
              <span className="text-ink font-normal">{brief.dataProfile}</span>
            ) : (
              <span className="italic">Belum ditentukan</span>
            )}
          </p>
        </div>

        {/* Item 4: Metode */}
        <div className="rounded-control border border-border bg-field p-3">
          <div className="flex items-center gap-2 font-medium text-ink">
            {brief.method ? (
              <CheckCircle size={16} className="text-success" />
            ) : (
              <CircleDashed size={16} className="text-ink-muted" />
            )}
            <span>4. Rekomendasi Metode</span>
          </div>
          <p className="mt-1.5 text-caption text-ink-muted">
            {brief.method ? (
              <span className="text-primary font-medium">{brief.method}</span>
            ) : (
              <span className="italic">Belum ditentukan</span>
            )}
          </p>
        </div>

        {/* Estimated Price */}
        {estimate && (
          <div className="rounded-control border border-primary/30 bg-primary-tint/30 p-3">
            <div className="flex items-center justify-between text-body-sm font-semibold text-primary-ink">
              <span>Estimasi Biaya Analisis</span>
              <span className="font-mono text-base font-bold">{formatRupiah(estimate.total)}</span>
            </div>
            {estimate.instrumentFee > 0 && (
              <p className="mt-1 text-caption text-primary-ink/80">
                Termasuk biaya uji validitas & reliabilitas instrumen ({formatRupiah(estimate.instrumentFee)}).
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <Button
          onClick={onProceedToOrder}
          disabled={!isComplete}
          variant="primary"
          className="w-full"
        >
          <span>{isComplete ? "Kirim Brief & Buat Pesanan" : "Lengkapi 4 Tahap di Chat"}</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
