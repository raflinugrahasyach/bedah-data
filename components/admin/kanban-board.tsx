"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  MagnifyingGlass,
  ArrowClockwise,
  Hourglass,
  GearSix,
  CheckCircle,
  Package,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/admin/order-card";
import { api, ApiError } from "@/lib/api-client";
import { ORDER_STATUSES, type OrderRecord, type OrderStatus } from "@/lib/types";

interface KanbanBoardProps {
  initialOrders: OrderRecord[];
}

export function KanbanBoard({ initialOrders }: KanbanBoardProps) {
  const [orders, setOrders] = React.useState<OrderRecord[]>(initialOrders);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingStatusId, setLoadingStatusId] = React.useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.listOrders();
      setOrders(res.orders);
    } catch {
      toast.error("Gagal memuat ulang daftar pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: OrderStatus) => {
    setLoadingStatusId(id);
    try {
      const res = await api.setStatus(id, nextStatus);
      setOrders((prev) =>
        prev.map((ord) => (ord.id === id ? res.order : ord)),
      );
      toast.success(`Status ${res.order.code} diperbarui ke ${nextStatus}.`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui status pesanan.");
      }
    } finally {
      setLoadingStatusId(null);
    }
  };

  // Filter orders by search term
  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.code.toLowerCase().includes(q) ||
      o.client.name.toLowerCase().includes(q) ||
      o.client.email.toLowerCase().includes(q) ||
      o.brief.method.toLowerCase().includes(q)
    );
  });

  const columns: { status: OrderStatus; title: string; hint: string; icon: React.ReactNode }[] = [
    {
      status: "pending",
      title: "Pending",
      hint: "Menunggu pembayaran / konfirmasi",
      icon: <Hourglass size={16} className="text-warn" />,
    },
    {
      status: "in_progress",
      title: "In Progress",
      hint: "Sedang dikerjakan analis",
      icon: <GearSix size={16} className="text-primary" />,
    },
    {
      status: "qc",
      title: "Quality Control",
      hint: "Pemeriksaan syntax & validitas",
      icon: <CheckCircle size={16} className="text-[#0284c7]" />,
    },
    {
      status: "delivered",
      title: "Delivered",
      hint: "Berkas lengkap terkirim ke klien",
      icon: <Package size={16} className="text-success" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Cari pesanan berdasarkan kode, nama klien, atau metode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchOrders}
            loading={loading}
          >
            <ArrowClockwise size={16} />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className="flex flex-col rounded-card border border-border bg-field/70 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="border-b border-border bg-surface p-3.5 rounded-t-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <span className="font-semibold text-body-sm text-ink">
                    {col.title}
                  </span>
                </div>
                <span className="rounded-control bg-border/70 px-2 py-0.5 font-mono text-caption font-semibold text-ink num">
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100svh-220px)] scroll-quiet">
                {colOrders.length === 0 ? (
                  <div className="rounded-control border border-dashed border-border p-6 text-center text-caption text-ink-muted">
                    Tidak ada pesanan di tahap ini.
                  </div>
                ) : (
                  colOrders.map((ord) => (
                    <OrderCard
                      key={ord.id}
                      order={ord}
                      onStatusChange={handleStatusChange}
                      loadingStatusId={loadingStatusId}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
