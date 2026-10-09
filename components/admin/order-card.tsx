"use client";

import Link from "next/link";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  Clock,
  DotsThreeVertical,
  CaretRight,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ORDER_STATUS_META, PAYMENT_STATUS_LABEL } from "@/lib/deliverables";
import { formatRupiah } from "@/lib/utils";
import type { OrderRecord, OrderStatus } from "@/lib/types";

interface OrderCardProps {
  order: OrderRecord;
  onStatusChange: (id: string, nextStatus: OrderStatus) => Promise<void>;
  loadingStatusId: string | null;
}

export function OrderCard({
  order,
  onStatusChange,
  loadingStatusId,
}: OrderCardProps) {
  const isUpdating = loadingStatusId === order.id;
  const deliverablesCount = order.workItem.deliverables.length;
  const isPaid = order.paymentStatus === "paid";

  const nextStatusOptions: { status: OrderStatus; label: string }[] = [];
  if (order.status === "pending") {
    nextStatusOptions.push({ status: "in_progress", label: "Mulai Kerjakan (In Progress)" });
  } else if (order.status === "in_progress") {
    nextStatusOptions.push({ status: "qc", label: "Ajukan ke QC" });
  } else if (order.status === "qc") {
    nextStatusOptions.push({ status: "delivered", label: "Kirim ke Klien (Delivered)" });
  }

  return (
    <div className="group rounded-card border border-border bg-surface p-4 shadow-card hover:border-border-strong transition-all flex flex-col justify-between gap-3">
      <div>
        {/* Header row: Code, Payment status, Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/orders/${order.id}`}
              className="font-mono text-body-sm font-bold text-ink hover:text-primary transition-colors"
            >
              {order.code}
            </Link>
            <Badge tone={isPaid ? "success" : "warn"}>
              {PAYMENT_STATUS_LABEL[order.paymentStatus]}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="size-7 flex items-center justify-center rounded-control text-ink-muted hover:bg-border/60 hover:text-ink transition-colors cursor-pointer"
                aria-label="Menu Opsi Pesanan"
              >
                <DotsThreeVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi Cepat Status</DropdownMenuLabel>
              {nextStatusOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.status}
                  onClick={() => onStatusChange(order.id, opt.status)}
                >
                  <CaretRight size={14} className="text-primary" />
                  <span>{opt.label}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link href={`/admin/orders/${order.id}`} className="w-full flex items-center gap-2">
                  <FileText size={14} />
                  <span>Buka Lembar Kerja Analis</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Client details */}
        <div className="mt-2">
          <div className="text-body-sm font-semibold text-ink truncate">
            {order.client.name}
          </div>
          <div className="text-caption text-ink-muted truncate">
            {order.client.email}
          </div>
        </div>

        {/* Method & Objective snippet */}
        <div className="mt-2.5 rounded-control bg-field border border-border p-2 text-caption">
          <div className="font-medium text-primary line-clamp-1">
            {order.brief.method}
          </div>
          <p className="mt-0.5 text-ink-muted line-clamp-2">
            {order.brief.objective}
          </p>
        </div>
      </div>

      {/* Footer row: Price & Deliverables counter */}
      <div className="border-t border-border pt-3 flex items-center justify-between text-caption">
        <div className="font-mono font-bold text-ink num">
          {formatRupiah(order.totalPrice)}
        </div>

        <div className="flex items-center gap-1.5 text-ink-muted">
          <FileText size={14} />
          <span className="num">{deliverablesCount}/3 Berkas</span>
        </div>
      </div>

      {/* Quick Action Button */}
      {nextStatusOptions.length > 0 && order.status !== "delivered" && (
        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-1"
          onClick={() => onStatusChange(order.id, nextStatusOptions[0].status)}
          loading={isUpdating}
        >
          <span>{nextStatusOptions[0].label}</span>
          <ArrowRight size={14} />
        </Button>
      )}

      {order.status === "delivered" && (
        <div className="rounded-control bg-success-tint/40 p-2 text-center text-caption font-medium text-success flex items-center justify-center gap-1.5">
          <CheckCircle size={14} />
          <span>Pesanan Selesai & Terkirim</span>
        </div>
      )}
    </div>
  );
}
