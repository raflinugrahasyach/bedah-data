"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  GearSix,
  Package,
  User,
  ShieldCheck,
  ArrowRight,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeliverablesManager } from "@/components/admin/deliverables-manager";
import { ActivityLog } from "@/components/admin/activity-log";
import { api, ApiError } from "@/lib/api-client";
import { ORDER_STATUS_META, PAYMENT_STATUS_LABEL } from "@/lib/deliverables";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import type { OrderRecord, OrderStatus } from "@/lib/types";

interface OrderDetailViewProps {
  initialOrder: OrderRecord;
}

export function OrderDetailView({ initialOrder }: OrderDetailViewProps) {
  const [order, setOrder] = React.useState<OrderRecord>(initialOrder);
  const [loadingAction, setLoadingAction] = React.useState(false);

  const isDelivered = order.status === "delivered";
  const isPaid = order.paymentStatus === "paid";

  const handleUpdateStatus = async (nextStatus: OrderStatus) => {
    setLoadingAction(true);
    try {
      const res = await api.setStatus(order.id, nextStatus);
      setOrder(res.order);
      toast.success(`Status berhasil diubah ke ${ORDER_STATUS_META[nextStatus].label}.`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mengubah status pesanan.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSimulatePayment = async () => {
    setLoadingAction(true);
    try {
      const res = await api.payOrder(order.id);
      setOrder(res.order);
      toast.success("Pembayaran berhasil dikonfirmasi.");
    } catch {
      toast.error("Gagal mengonfirmasi pembayaran.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Status Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <ArrowLeft size={16} />
              <span>Kembali ke Pipeline</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-border" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-ink">
                {order.code}
              </span>
              <Badge
                tone={
                  order.status === "delivered"
                    ? "success"
                    : order.status === "qc"
                      ? "primary"
                      : order.status === "in_progress"
                        ? "primary"
                        : "warn"
                }
              >
                {ORDER_STATUS_META[order.status].label}
              </Badge>
              <Badge tone={isPaid ? "success" : "warn"}>
                {PAYMENT_STATUS_LABEL[order.paymentStatus]}
              </Badge>
            </div>
            <p className="text-caption text-ink-muted">
              Dibuat pada {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Transition Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {!isPaid && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSimulatePayment}
              loading={loadingAction}
            >
              <CreditCard size={16} />
              <span>Konfirmasi Pembayaran</span>
            </Button>
          )}

          {order.status === "pending" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleUpdateStatus("in_progress")}
              loading={loadingAction}
              disabled={!isPaid}
              title={!isPaid ? "Harus lunas terlebih dahulu" : undefined}
            >
              <GearSix size={16} />
              <span>Mulai Kerjakan (In Progress)</span>
            </Button>
          )}

          {order.status === "in_progress" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleUpdateStatus("qc")}
              loading={loadingAction}
            >
              <ShieldCheck size={16} />
              <span>Ajukan ke QC Review</span>
            </Button>
          )}

          {order.status === "qc" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleUpdateStatus("delivered")}
              loading={loadingAction}
            >
              <Package size={16} />
              <span>Selesaikan & Kirim ke Klien</span>
            </Button>
          )}

          {isDelivered && (
            <div className="flex items-center gap-1.5 text-caption font-medium text-success bg-success-tint px-3 py-1.5 rounded-control">
              <CheckCircle size={16} />
              <span>Pesanan Selesai & Berkas Terkirim</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Workspace & Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Brief and File Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brief Overview */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <h2 className="text-body font-semibold text-ink border-b border-border pb-3 mb-4">
              Lembar Brief Metodologi (Tahap 1)
            </h2>

            <div className="space-y-4 text-body-sm">
              <div>
                <span className="text-caption font-medium text-ink-muted uppercase tracking-wider block mb-1">
                  Metode Analisis
                </span>
                <span className="font-semibold text-primary text-base">
                  {order.brief.method}
                </span>
              </div>

              <div>
                <span className="text-caption font-medium text-ink-muted uppercase tracking-wider block mb-1">
                  Tujuan Penelitian
                </span>
                <p className="text-ink leading-relaxed rounded-control bg-field border border-border p-3">
                  {order.brief.objective}
                </p>
              </div>

              <div>
                <span className="text-caption font-medium text-ink-muted uppercase tracking-wider block mb-1">
                  Struktur Variabel
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-control bg-field border border-border p-3 text-caption">
                    <span className="font-medium text-ink-muted block mb-1">Variabel Bebas (X):</span>
                    <span className="text-ink font-medium">
                      {order.brief.variables.independent.length > 0
                        ? order.brief.variables.independent.join(", ")
                        : order.brief.variables.summary}
                    </span>
                  </div>
                  <div className="rounded-control bg-field border border-border p-3 text-caption">
                    <span className="font-medium text-ink-muted block mb-1">Variabel Terikat (Y):</span>
                    <span className="text-ink font-medium">
                      {order.brief.variables.dependent.length > 0
                        ? order.brief.variables.dependent.join(", ")
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-caption font-medium text-ink-muted uppercase tracking-wider block mb-1">
                  Profil & Karakteristik Data
                </span>
                <p className="text-caption text-ink leading-relaxed rounded-control bg-field border border-border p-3">
                  {order.brief.dataProfile}
                </p>
              </div>
            </div>
          </div>

          {/* Deliverables Manager */}
          <DeliverablesManager
            order={order}
            onOrderUpdated={(updated) => setOrder(updated)}
          />
        </div>

        {/* Right Col: Client, Payment & Activity Audit */}
        <div className="space-y-6">
          {/* Client & Finance Card */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-card space-y-4">
            <h3 className="text-body font-semibold text-ink border-b border-border pb-3 flex items-center gap-2">
              <User size={18} className="text-primary" />
              <span>Informasi Klien & Biaya</span>
            </h3>

            <div className="space-y-3 text-caption">
              <div>
                <span className="text-ink-muted block">Nama Klien:</span>
                <span className="font-semibold text-ink text-body-sm">
                  {order.client.name}
                </span>
              </div>
              <div>
                <span className="text-ink-muted block">Email:</span>
                <span className="text-ink font-mono">{order.client.email}</span>
              </div>
              <div className="border-t border-border pt-3">
                <span className="text-ink-muted block">Total Biaya Analisis:</span>
                <span className="font-mono text-xl font-bold text-ink">
                  {formatRupiah(order.totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-ink-muted">Status Pembayaran:</span>
                <Badge tone={isPaid ? "success" : "warn"}>
                  {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Activity Log Audit Timeline */}
          <ActivityLog activity={order.activity} />
        </div>
      </div>
    </div>
  );
}
