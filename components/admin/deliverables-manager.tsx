"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  FileText,
  FileCode,
  Table,
  UploadSimple,
  Trash,
  CheckCircle,
  FileXls,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api-client";
import {
  DELIVERABLE_SPECS,
  getSpec,
  type DeliverableSpec,
} from "@/lib/deliverables";
import { formatBytes, formatDateTime } from "@/lib/utils";
import type { Deliverable, DeliverableKind, OrderRecord } from "@/lib/types";

interface DeliverablesManagerProps {
  order: OrderRecord;
  onOrderUpdated: (updated: OrderRecord) => void;
}

export function DeliverablesManager({
  order,
  onOrderUpdated,
}: DeliverablesManagerProps) {
  const [loadingKind, setLoadingKind] = React.useState<DeliverableKind | null>(null);
  const isDelivered = order.status === "delivered";

  const getUploaded = (kind: DeliverableKind): Deliverable | undefined => {
    return order.workItem.deliverables.find((d) => d.kind === kind);
  };

  const handleUploadSample = async (spec: DeliverableSpec) => {
    if (isDelivered) {
      toast.error("Pesanan sudah terkirim. Berkas tidak dapat diubah.");
      return;
    }

    setLoadingKind(spec.kind);
    try {
      const ext = spec.extensions[0];
      const sampleName = `${spec.kind}_${order.code.toLowerCase()}${ext}`;
      const sampleSize =
        spec.kind === "cleaned_data"
          ? 342_000
          : spec.kind === "syntax"
            ? 7_800
            : 1_120_000;

      const res = await api.uploadDeliverable(order.id, spec.kind, {
        name: sampleName,
        size: sampleSize,
      });

      onOrderUpdated(res.order);
      toast.success(`Berkas ${spec.label} berhasil dilampirkan.`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mengunggah berkas.");
      }
    } finally {
      setLoadingKind(null);
    }
  };

  const handleCustomFileUpload = async (
    spec: DeliverableSpec,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingKind(spec.kind);
    try {
      const res = await api.uploadDeliverable(order.id, spec.kind, {
        name: file.name,
        size: file.size,
      });
      onOrderUpdated(res.order);
      toast.success(`Berkas ${file.name} berhasil diunggah.`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mengunggah berkas.");
      }
    } finally {
      setLoadingKind(null);
      e.target.value = "";
    }
  };

  const handleRemove = async (kind: DeliverableKind) => {
    if (isDelivered) {
      toast.error("Pesanan sudah terkirim. Berkas tidak dapat dihapus.");
      return;
    }

    setLoadingKind(kind);
    try {
      const res = await api.removeDeliverable(order.id, kind);
      onOrderUpdated(res.order);
      toast.success("Berkas berhasil dihapus.");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menghapus berkas.");
      }
    } finally {
      setLoadingKind(null);
    }
  };

  const totalUploaded = order.workItem.deliverables.length;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h2 className="text-body font-semibold text-ink">
            Manajemen Berkas Deliverables (Tahap 4 & 5)
          </h2>
          <p className="text-caption text-ink-muted">
            Setiap pesanan wajib melampirkan 3 berkas sebelum dapat dikirim (Delivered) ke klien.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-caption text-ink-muted">Kelengkapan:</span>
          <Badge tone={totalUploaded === 3 ? "success" : "warn"}>
            {totalUploaded}/3 Berkas Siap
          </Badge>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {DELIVERABLE_SPECS.map((spec) => {
          const uploaded = getUploaded(spec.kind);
          const isLoading = loadingKind === spec.kind;

          return (
            <div
              key={spec.kind}
              className="rounded-card border border-border bg-field p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-control bg-primary-tint text-primary flex items-center justify-center shrink-0 mt-0.5">
                  {spec.kind === "cleaned_data" && <Table size={20} />}
                  {spec.kind === "syntax" && <FileCode size={20} />}
                  {spec.kind === "report" && <FileText size={20} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-body-sm text-ink">
                      {spec.label}
                    </span>
                    <span className="text-caption font-mono text-ink-muted">
                      ({spec.extensions.join(", ")})
                    </span>
                    {uploaded && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                        <CheckCircle size={14} /> Terlampir
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-caption text-ink-muted">
                    {spec.description}
                  </p>

                  {uploaded && (
                    <div className="mt-2 flex items-center gap-3 text-caption font-mono text-ink">
                      <span className="font-medium underline decoration-border-strong">
                        {uploaded.name}
                      </span>
                      <span className="text-ink-muted">
                        {formatBytes(uploaded.size)}
                      </span>
                      <span className="text-ink-muted">
                        • {formatDateTime(uploaded.uploadedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {uploaded ? (
                  !isDelivered && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(spec.kind)}
                      loading={isLoading}
                      className="text-danger hover:bg-danger-tint hover:text-danger"
                    >
                      <Trash size={16} />
                      <span>Hapus</span>
                    </Button>
                  )
                ) : (
                  <>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-control border border-border-strong bg-surface px-3 py-1.5 text-body-sm font-medium text-ink hover:bg-primary-tint transition-colors">
                      <UploadSimple size={16} />
                      <span>Pilih File</span>
                      <input
                        type="file"
                        className="sr-only"
                        disabled={isLoading || isDelivered}
                        accept={spec.extensions.join(",")}
                        onChange={(e) => handleCustomFileUpload(spec, e)}
                      />
                    </label>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUploadSample(spec)}
                      loading={isLoading}
                      disabled={isDelivered}
                      title="Lampirkan berkas dummy untuk demonstrasi cepat"
                    >
                      <span>+ Berkas Sampel</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
