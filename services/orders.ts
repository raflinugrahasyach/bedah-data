import { randomUUID } from "node:crypto";
import { getSpec, validateUpload } from "@/lib/deliverables";
import { seedOrders } from "@/lib/mock-data";
import { estimatePrice, type PriceEstimate } from "@/lib/pricing";
import {
  DELIVERABLE_KINDS,
  type CompletedBrief,
  type DeliverableKind,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/types";
import { ORDER_STATUS_META } from "@/lib/deliverables";
import {
  createCalcomBooking,
  createMidtransPayment,
  notifyN8n,
  type CalcomBooking,
  type MidtransPayment,
} from "@/services/integrations";

/**
 * Order service. Backed by an in-memory store that survives HMR (globalThis),
 * so every dashboard action in the demo really changes state until the server
 * restarts. The function signatures are what a Supabase-backed implementation
 * (see schema.sql) would expose; only this file needs to change to go live.
 */

export type ServiceError = { code: "not_found" | "invalid" | "conflict"; message: string };
export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

const ok = <T>(data: T): ServiceResult<T> => ({ ok: true, data });
const fail = (code: ServiceError["code"], message: string): ServiceResult<never> => ({
  ok: false,
  error: { code, message },
});

const globalStore = globalThis as typeof globalThis & { __bedahOrders?: OrderRecord[] };

function db(): OrderRecord[] {
  if (!globalStore.__bedahOrders) globalStore.__bedahOrders = seedOrders();
  return globalStore.__bedahOrders;
}

const clone = <T>(value: T): T => structuredClone(value);
const now = () => new Date().toISOString();

function find(idOrCode: string): OrderRecord | undefined {
  return db().find((order) => order.id === idOrCode || order.code === idOrCode);
}

function log(order: OrderRecord, text: string) {
  const at = now();
  order.activity.push({ at, text });
  order.updatedAt = at;
}

function nextCode(): string {
  const highest = db().reduce((max, order) => Math.max(max, Number(order.code.replace("BD-", "")) || 0), 1000);
  return `BD-${highest + 1}`;
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export function listOrders(): OrderRecord[] {
  return clone([...db()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export function getOrder(idOrCode: string): ServiceResult<OrderRecord> {
  const order = find(idOrCode);
  return order ? ok(clone(order)) : fail("not_found", "Pesanan tidak ditemukan.");
}

/* ------------------------------------------------------------------ */
/* Tahap 1 -> 2: intake submission                                     */
/* ------------------------------------------------------------------ */

export interface CreatedOrder {
  order: OrderRecord;
  payment: MidtransPayment;
  estimate: PriceEstimate;
}

export function createOrder(input: { name: string; email: string; brief: CompletedBrief }): ServiceResult<CreatedOrder> {
  const estimate = estimatePrice(input.brief.method, input.brief.dataProfile);
  const existingClient = db().find((order) => order.client.email === input.email)?.client;
  const at = now();
  const order: OrderRecord = {
    id: randomUUID(),
    code: nextCode(),
    status: "pending",
    paymentStatus: "unpaid",
    totalPrice: estimate.total,
    createdAt: at,
    updatedAt: at,
    client: existingClient ?? { id: randomUUID(), name: input.name, email: input.email },
    brief: clone(input.brief),
    workItem: { id: randomUUID(), analystStatus: "not_started", deliverables: [] },
    activity: [{ at, text: "Brief diterima dari chatbot konsultasi." }],
  };
  const n8n = notifyN8n("order.created");
  log(order, `Notifikasi n8n terkirim (simulasi): ${n8n.workflow}`);
  db().push(order);
  return ok({ order: clone(order), payment: createMidtransPayment(order), estimate });
}

export function markPaid(idOrCode: string): ServiceResult<OrderRecord> {
  const order = find(idOrCode);
  if (!order) return fail("not_found", "Pesanan tidak ditemukan.");
  if (order.paymentStatus === "paid") return ok(clone(order));
  order.paymentStatus = "paid";
  log(order, "Pembayaran dikonfirmasi (simulasi Midtrans).");
  notifyN8n("order.paid");
  return ok(clone(order));
}

export function bookCall(idOrCode: string): ServiceResult<{ order: OrderRecord; booking: CalcomBooking }> {
  const order = find(idOrCode);
  if (!order) return fail("not_found", "Pesanan tidak ditemukan.");
  const booking = createCalcomBooking();
  log(order, "Sesi call 15 menit dijadwalkan (simulasi Cal.com).");
  return ok({ order: clone(order), booking });
}

/* ------------------------------------------------------------------ */
/* Tahap 4 and 5: pipeline + work item                                 */
/* ------------------------------------------------------------------ */

export function setOrderStatus(idOrCode: string, next: OrderStatus): ServiceResult<OrderRecord> {
  const order = find(idOrCode);
  if (!order) return fail("not_found", "Pesanan tidak ditemukan.");
  if (order.status === next) return ok(clone(order));
  if (order.status === "delivered") {
    return fail("conflict", "Pesanan yang sudah terkirim tidak bisa dibuka kembali.");
  }

  const uploaded = order.workItem.deliverables.length;

  if (next === "in_progress" && order.paymentStatus !== "paid") {
    return fail("conflict", "Pembayaran belum dikonfirmasi. Tandai lunas dulu sebelum pengerjaan dimulai.");
  }
  if (next === "qc" && uploaded === 0) {
    return fail("conflict", "Unggah minimal satu berkas hasil sebelum memindahkan ke QC.");
  }
  if (next === "delivered" && uploaded < DELIVERABLE_KINDS.length) {
    const missing = DELIVERABLE_KINDS.filter((kind) => !order.workItem.deliverables.some((item) => item.kind === kind))
      .map((kind) => getSpec(kind).label)
      .join(", ");
    return fail("conflict", `Belum bisa dikirim. Berkas yang belum ada: ${missing}.`);
  }
  if (next === "pending") {
    return fail("conflict", "Pesanan tidak bisa dikembalikan ke Pending.");
  }

  const previous = order.status;
  order.status = next;
  order.workItem.analystStatus =
    next === "in_progress" ? "in_progress" : next === "qc" ? "ready_for_qc" : "approved";

  const n8n = notifyN8n(next === "delivered" ? "order.delivered" : "order.status_changed");
  log(
    order,
    `Status dipindah dari ${ORDER_STATUS_META[previous].label} ke ${ORDER_STATUS_META[next].label}. Notifikasi n8n terkirim (simulasi): ${n8n.workflow}`,
  );
  return ok(clone(order));
}

export function attachDeliverable(
  idOrCode: string,
  kind: DeliverableKind,
  file: { name: string; size: number },
): ServiceResult<OrderRecord> {
  const order = find(idOrCode);
  if (!order) return fail("not_found", "Pesanan tidak ditemukan.");
  const problem = validateUpload(kind, file.name, file.size);
  if (problem) return fail("invalid", problem);
  if (order.status === "delivered") {
    return fail("conflict", "Pesanan sudah terkirim. Berkas tidak bisa diubah lagi.");
  }

  const rest = order.workItem.deliverables.filter((item) => item.kind !== kind);
  rest.push({ kind, name: file.name, size: file.size, uploadedAt: now() });
  order.workItem.deliverables = rest;
  log(order, `Berkas ${getSpec(kind).label} diunggah: ${file.name}`);
  return ok(clone(order));
}

export function removeDeliverable(idOrCode: string, kind: DeliverableKind): ServiceResult<OrderRecord> {
  const order = find(idOrCode);
  if (!order) return fail("not_found", "Pesanan tidak ditemukan.");
  if (order.status === "delivered") {
    return fail("conflict", "Pesanan sudah terkirim. Berkas tidak bisa dihapus.");
  }
  const target = order.workItem.deliverables.find((item) => item.kind === kind);
  if (!target) return fail("not_found", "Berkas tidak ditemukan.");

  order.workItem.deliverables = order.workItem.deliverables.filter((item) => item.kind !== kind);
  log(order, `Berkas ${getSpec(kind).label} dihapus: ${target.name}`);
  return ok(clone(order));
}
