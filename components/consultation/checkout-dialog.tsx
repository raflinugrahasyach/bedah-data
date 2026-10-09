"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  CreditCard,
  CalendarCheck,
  ArrowRight,
  CircleNotch,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api-client";
import { estimatePrice } from "@/lib/pricing";
import { formatRupiah } from "@/lib/utils";
import type { CompletedBrief, OrderRecord } from "@/lib/types";
import type { CalcomBooking } from "@/services/integrations";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brief: CompletedBrief | null;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  brief,
}: CheckoutDialogProps) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Success flow states
  const [createdOrder, setCreatedOrder] = React.useState<OrderRecord | null>(null);
  const [isPaid, setIsPaid] = React.useState(false);
  const [booking, setBooking] = React.useState<CalcomBooking | null>(null);

  if (!brief) return null;

  const estimate = estimatePrice(brief.method, brief.dataProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create order
      const res = await api.createOrder({
        name: name.trim(),
        email: email.trim(),
        brief,
      });

      setCreatedOrder(res.order);

      // 2. Simulate Midtrans payment
      const paidRes = await api.payOrder(res.order.id);
      setIsPaid(true);
      setCreatedOrder(paidRes.order);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal membuat pesanan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookCall = async () => {
    if (!createdOrder) return;
    setLoading(true);
    try {
      const res = await api.bookCall(createdOrder.id);
      setBooking(res.booking);
      setCreatedOrder(res.order);
    } catch (err) {
      setError("Gagal menjadwalkan konsultasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToOrder = () => {
    if (createdOrder) {
      onOpenChange(false);
      router.push(`/admin/orders/${createdOrder.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {!createdOrder ? (
          <>
            <DialogTitle>Konfirmasi & Kirim Brief Metodologi</DialogTitle>
            <DialogDescription>
              Isi data kontakmu untuk menerima invoice, tautan call, dan berkas analisis.
            </DialogDescription>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Field id="client-name" label="Nama Lengkap" required error={error ? "" : null}>
                {(aria) => (
                  <Input
                    {...aria}
                    placeholder="Contoh: Aulia Rahma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                )}
              </Field>

              <Field id="client-email" label="Alamat Email Kampus / Pribadi" required>
                {(aria) => (
                  <Input
                    {...aria}
                    type="email"
                    placeholder="nama@kampus.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                )}
              </Field>

              {/* Order Brief Summary */}
              <div className="rounded-control border border-border bg-field p-3 space-y-2 text-caption">
                <div className="font-semibold text-ink text-body-sm border-b border-border pb-1">
                  Rincian Brief
                </div>
                <div>
                  <span className="font-medium text-ink-muted">Metode: </span>
                  <span className="text-ink font-semibold">{brief.method}</span>
                </div>
                <div>
                  <span className="font-medium text-ink-muted">Tujuan: </span>
                  <span className="text-ink">{brief.objective}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border font-semibold text-body-sm text-ink">
                  <span>Total Biaya</span>
                  <span className="font-mono text-base text-primary font-bold">
                    {formatRupiah(estimate.total)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-control bg-danger-tint p-2.5 text-caption font-medium text-danger">
                  {error}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                  <CreditCard size={18} />
                  <span>Kirim & Simulasi Bayar Midtrans</span>
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-tint text-success">
              <CheckCircle size={32} />
            </div>

            <DialogTitle className="text-center pr-0">
              Pesanan {createdOrder.code} Berhasil Dikonfirmasi!
            </DialogTitle>
            <DialogDescription className="text-center">
              Pembayaran lunas disimulasikan. Brief telah masuk ke antrean analis Bedah Data.
            </DialogDescription>

            <div className="rounded-card border border-border bg-field p-4 text-left space-y-2 text-caption">
              <div className="flex justify-between">
                <span className="text-ink-muted">Kode Pesanan:</span>
                <span className="font-mono font-bold text-ink">{createdOrder.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Status Pembayaran:</span>
                <span className="font-semibold text-success">Lunas (Midtrans Mock)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Status Pipeline:</span>
                <span className="font-semibold text-ink">Pending (Siap Dikerjakan)</span>
              </div>
            </div>

            {/* Tahap 3: Call Booking */}
            {!booking ? (
              <div className="rounded-card border border-border bg-surface p-4 text-left">
                <h4 className="text-body-sm font-semibold text-ink flex items-center gap-2">
                  <CalendarCheck size={18} className="text-primary" />
                  Tahap 3: Jadwalkan 15-Menit Sync Call
                </h4>
                <p className="mt-1 text-caption text-ink-muted">
                  Sinkronisasi variabel dan arahan pembimbing bersama analis metodologi.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={handleBookCall}
                  loading={loading}
                >
                  Jadwalkan Panggilan (Simulasi Cal.com)
                </Button>
              </div>
            ) : (
              <div className="rounded-card border border-success/30 bg-success-tint/20 p-4 text-left">
                <div className="flex items-center gap-2 text-success font-semibold text-body-sm">
                  <CheckCircle size={18} />
                  Sesi Call 15 Menit Terjadwal!
                </div>
                <p className="mt-1 text-caption text-ink-muted">
                  Waktu: {new Date(booking.startsAt).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB. Tautan meeting telah disimulasikan.
                </p>
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={handleGoToOrder} variant="primary" className="w-full">
                <span>Lihat Pesanan di Admin Pipeline</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
