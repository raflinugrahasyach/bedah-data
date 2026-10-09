import { getSpec, validateUpload } from "@/lib/deliverables";
import { estimatePrice, type PriceEstimate } from "@/lib/pricing";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  DELIVERABLE_KINDS,
  type CompletedBrief,
  type DeliverableKind,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/types";
import {
  createCalcomBooking,
  createMidtransPayment,
  notifyN8n,
  type CalcomBooking,
  type MidtransPayment,
} from "@/services/integrations";

export type ServiceError = { code: "not_found" | "invalid" | "conflict"; message: string };
export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

const ok = <T>(data: T): ServiceResult<T> => ({ ok: true, data });
const fail = (code: ServiceError["code"], message: string): ServiceResult<never> => ({
  ok: false,
  error: { code, message },
});

const KNOWN_CODES: Record<string, string> = {
  "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e01": "BD-1041",
  "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e02": "BD-1040",
  "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e03": "BD-1039",
  "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e04": "BD-1038",
  "7d6f3c10-5a0e-4a44-9d0f-0a1b2c3d4e05": "BD-1035",
};

export function getOrderCode(id: string): string {
  if (KNOWN_CODES[id]) return KNOWN_CODES[id];
  const cleanId = id.replace(/-/g, "");
  const num = (parseInt(cleanId.slice(0, 6), 16) % 8957) + 1042;
  return `BD-${num}`;
}

interface SupabaseOrderRow {
  id: string;
  client_id: string;
  status: OrderStatus;
  total_price: number;
  payment_status: "unpaid" | "paid" | "refunded";
  created_at: string;
  updated_at: string;
  clients?: any;
  research_briefs?: any;
  work_items?: any;
}

function orderToRecord(row: SupabaseOrderRow): OrderRecord {
  const briefRow = Array.isArray(row.research_briefs) ? row.research_briefs[0] : row.research_briefs;
  const workItemRow = Array.isArray(row.work_items) ? row.work_items[0] : row.work_items;
  const clientRow = Array.isArray(row.clients) ? row.clients[0] : row.clients;

  const rawVars = briefRow?.variables;
  const variables =
    rawVars && typeof rawVars === "object"
      ? {
          summary: String(rawVars.summary || ""),
          independent: Array.isArray(rawVars.independent) ? rawVars.independent.map(String) : [],
          dependent: Array.isArray(rawVars.dependent) ? rawVars.dependent.map(String) : [],
        }
      : { summary: "", independent: [], dependent: [] };

  const deliverables = Array.isArray(workItemRow?.deliverables) ? workItemRow.deliverables : [];

  const activity = [
    { at: row.created_at, text: "Brief diterima dari chatbot konsultasi." },
    ...(row.payment_status === "paid"
      ? [{ at: row.updated_at, text: "Pembayaran dikonfirmasi via Midtrans." }]
      : []),
    ...(row.status === "in_progress"
      ? [{ at: row.updated_at, text: "Status dipindah ke Sedang Dikerjakan. Analis mulai memproses data." }]
      : []),
    ...(row.status === "qc"
      ? [{ at: row.updated_at, text: "Status dipindah ke Quality Control (QC)." }]
      : []),
    ...(row.status === "delivered"
      ? [{ at: row.updated_at, text: "Status dipindah ke Selesai (Delivered). Notifikasi n8n terkirim." }]
      : []),
  ];

  return {
    id: row.id,
    code: getOrderCode(row.id),
    status: row.status,
    paymentStatus: row.payment_status,
    totalPrice: row.total_price,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    client: {
      id: clientRow?.id ?? row.client_id,
      name: clientRow?.name ?? "Klien",
      email: clientRow?.email ?? "",
    },
    brief: {
      objective: briefRow?.objective ?? "",
      variables,
      dataProfile: briefRow?.data_profile ?? "",
      method: briefRow?.method ?? "",
    },
    workItem: {
      id: workItemRow?.id ?? row.id,
      analystStatus: workItemRow?.analyst_status ?? "not_started",
      deliverables,
    },
    activity,
  };
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export async function listOrders(): Promise<OrderRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*, clients(*), research_briefs(*), work_items(*)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[services/orders] Error fetching orders from Supabase:", error);
    return [];
  }

  return (data as SupabaseOrderRow[]).map(orderToRecord);
}

export async function getOrder(idOrCode: string): Promise<ServiceResult<OrderRecord>> {
  const supabase = getSupabaseAdmin();

  // Try direct lookup by UUID if formatted as UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);

  if (isUuid) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, clients(*), research_briefs(*), work_items(*)")
      .eq("id", idOrCode)
      .maybeSingle();

    if (error) {
      console.error("[services/orders] Error fetching order by ID:", error);
      return fail("not_found", "Pesanan tidak ditemukan.");
    }
    if (data) {
      return ok(orderToRecord(data as SupabaseOrderRow));
    }
  }

  // Lookup by Code (e.g. BD-1041) or fallback
  const { data: allOrders, error: listErr } = await supabase
    .from("orders")
    .select("*, clients(*), research_briefs(*), work_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (listErr || !allOrders) {
    return fail("not_found", "Pesanan tidak ditemukan.");
  }

  const match = (allOrders as SupabaseOrderRow[]).find((row) => {
    return row.id === idOrCode || getOrderCode(row.id).toLowerCase() === idOrCode.toLowerCase();
  });

  if (!match) {
    return fail("not_found", "Pesanan tidak ditemukan.");
  }

  return ok(orderToRecord(match));
}

/* ------------------------------------------------------------------ */
/* Tahap 1 -> 2: intake submission                                     */
/* ------------------------------------------------------------------ */

export interface CreatedOrder {
  order: OrderRecord;
  payment: MidtransPayment;
  estimate: PriceEstimate;
}

export async function createOrder(input: {
  name: string;
  email: string;
  brief: CompletedBrief;
}): Promise<ServiceResult<CreatedOrder>> {
  const supabase = getSupabaseAdmin();
  const estimate = estimatePrice(input.brief.method, input.brief.dataProfile);

  // 1. Find or create client
  let clientId: string;
  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("email", input.email)
    .maybeSingle();

  if (existingClient?.id) {
    clientId = existingClient.id;
  } else {
    const { data: newClient, error: clientErr } = await supabase
      .from("clients")
      .insert({ name: input.name, email: input.email })
      .select("id")
      .single();

    if (clientErr || !newClient) {
      console.error("[services/orders] Error creating client in Supabase:", clientErr);
      return fail("invalid", "Gagal menyimpan data klien.");
    }
    clientId = newClient.id;
  }

  // 2. Insert order row
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      client_id: clientId,
      status: "pending",
      payment_status: "unpaid",
      total_price: estimate.total,
    })
    .select()
    .single();

  if (orderErr || !orderRow) {
    console.error("[services/orders] Error creating order in Supabase:", orderErr);
    return fail("invalid", "Gagal membuat pesanan di database.");
  }

  // 3. Insert research_brief row
  const { error: briefErr } = await supabase.from("research_briefs").insert({
    order_id: orderRow.id,
    objective: input.brief.objective,
    variables: input.brief.variables,
    data_profile: input.brief.dataProfile,
    method: input.brief.method,
  });

  if (briefErr) {
    console.error("[services/orders] Error creating research brief in Supabase:", briefErr);
  }

  // 4. Retrieve complete order with joined records
  const fullResult = await getOrder(orderRow.id);
  if (!fullResult.ok) {
    return fail("not_found", "Pesanan berhasil dibuat namun gagal dimuat kembali.");
  }

  const orderRecord = fullResult.data;

  // 5. Notify n8n webhook
  await notifyN8n("order.created", {
    orderId: orderRecord.id,
    code: orderRecord.code,
    clientName: orderRecord.client.name,
    clientEmail: orderRecord.client.email,
    totalPrice: orderRecord.totalPrice,
    method: orderRecord.brief.method,
  });

  return ok({
    order: orderRecord,
    payment: createMidtransPayment(orderRecord),
    estimate,
  });
}

export async function markPaid(idOrCode: string): Promise<ServiceResult<OrderRecord>> {
  const orderRes = await getOrder(idOrCode);
  if (!orderRes.ok) return orderRes;

  const order = orderRes.data;
  if (order.paymentStatus === "paid") return ok(order);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "paid" })
    .eq("id", order.id);

  if (error) {
    console.error("[services/orders] Error updating payment status:", error);
    return fail("invalid", "Gagal memperbarui status pembayaran.");
  }

  await notifyN8n("order.paid", {
    orderId: order.id,
    code: order.code,
    clientName: order.client.name,
    totalPrice: order.totalPrice,
  });

  return getOrder(order.id);
}

export async function bookCall(idOrCode: string): Promise<ServiceResult<{ order: OrderRecord; booking: CalcomBooking }>> {
  const orderRes = await getOrder(idOrCode);
  if (!orderRes.ok) return orderRes;

  const order = orderRes.data;
  const booking = createCalcomBooking();

  await notifyN8n("order.call_booked", {
    orderId: order.id,
    code: order.code,
    clientName: order.client.name,
    startsAt: booking.startsAt,
  });

  return ok({ order, booking });
}

/* ------------------------------------------------------------------ */
/* Tahap 4 and 5: pipeline + work item                                 */
/* ------------------------------------------------------------------ */

export async function setOrderStatus(idOrCode: string, next: OrderStatus): Promise<ServiceResult<OrderRecord>> {
  const orderRes = await getOrder(idOrCode);
  if (!orderRes.ok) return orderRes;

  const order = orderRes.data;
  if (order.status === next) return ok(order);
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

  const supabase = getSupabaseAdmin();
  const { error: orderUpdateErr } = await supabase
    .from("orders")
    .update({ status: next })
    .eq("id", order.id);

  if (orderUpdateErr) {
    console.error("[services/orders] Error updating order status:", orderUpdateErr);
    return fail("invalid", "Gagal memperbarui status pesanan.");
  }

  const analystStatus =
    next === "in_progress" ? "in_progress" : next === "qc" ? "ready_for_qc" : "approved";

  await supabase
    .from("work_items")
    .update({ analyst_status: analystStatus })
    .eq("order_id", order.id);

  await notifyN8n(next === "delivered" ? "order.delivered" : "order.status_changed", {
    orderId: order.id,
    code: order.code,
    status: next,
  });

  return getOrder(order.id);
}

export async function attachDeliverable(
  idOrCode: string,
  kind: DeliverableKind,
  file: { name: string; size: number },
): Promise<ServiceResult<OrderRecord>> {
  const orderRes = await getOrder(idOrCode);
  if (!orderRes.ok) return orderRes;

  const order = orderRes.data;
  const problem = validateUpload(kind, file.name, file.size);
  if (problem) return fail("invalid", problem);
  if (order.status === "delivered") {
    return fail("conflict", "Pesanan sudah terkirim. Berkas tidak bisa diubah lagi.");
  }

  const rest = order.workItem.deliverables.filter((item) => item.kind !== kind);
  const updatedDeliverables = [
    ...rest,
    { kind, name: file.name, size: file.size, uploadedAt: new Date().toISOString() },
  ];

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("work_items")
    .update({ deliverables: updatedDeliverables })
    .eq("order_id", order.id);

  if (error) {
    console.error("[services/orders] Error updating deliverables:", error);
    return fail("invalid", "Gagal mengunggah berkas hasil.");
  }

  return getOrder(order.id);
}

export async function removeDeliverable(idOrCode: string, kind: DeliverableKind): Promise<ServiceResult<OrderRecord>> {
  const orderRes = await getOrder(idOrCode);
  if (!orderRes.ok) return orderRes;

  const order = orderRes.data;
  if (order.status === "delivered") {
    return fail("conflict", "Pesanan sudah terkirim. Berkas tidak bisa dihapus.");
  }
  const target = order.workItem.deliverables.find((item) => item.kind === kind);
  if (!target) return fail("not_found", "Berkas tidak ditemukan.");

  const rest = order.workItem.deliverables.filter((item) => item.kind !== kind);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("work_items")
    .update({ deliverables: rest })
    .eq("order_id", order.id);

  if (error) {
    console.error("[services/orders] Error removing deliverable:", error);
    return fail("invalid", "Gagal menghapus berkas.");
  }

  return getOrder(order.id);
}
