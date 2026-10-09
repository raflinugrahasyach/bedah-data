import type { ConsultationTurn, Stage } from "@/lib/consultation";
import type { CalcomBooking, MidtransPayment } from "@/services/integrations";
import type { PriceEstimate } from "@/lib/pricing";
import type { CompletedBrief, DeliverableKind, OrderRecord, OrderStatus, ResearchBrief } from "@/lib/types";

/** Thin typed fetch layer for the mock API. Every client component goes through here. */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.", 0, "network");
  }
  const body = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string } }
    | T
    | null;
  if (!response.ok) {
    const error = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(error?.message ?? "Permintaan gagal diproses.", response.status, error?.code ?? "unknown");
  }
  return body as T;
}

const json = (value: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(value) });

export type ChatTurnResponse = ConsultationTurn & { meta: { model: string; mock: boolean; latencyMs: number } };

export const api = {
  chat: (input: { message: string; brief: ResearchBrief; awaiting: Stage }) =>
    request<ChatTurnResponse>("/api/chat", json(input)),

  createOrder: (input: { name: string; email: string; brief: CompletedBrief }) =>
    request<{ order: OrderRecord; payment: MidtransPayment; estimate: PriceEstimate }>("/api/orders", json(input)),

  payOrder: (id: string) => request<{ order: OrderRecord }>(`/api/orders/${id}/payment`, { method: "POST" }),

  bookCall: (id: string) =>
    request<{ order: OrderRecord; booking: CalcomBooking }>(`/api/orders/${id}/booking`, { method: "POST" }),

  listOrders: () => request<{ orders: OrderRecord[] }>("/api/orders"),

  getOrder: (id: string) => request<{ order: OrderRecord }>(`/api/orders/${id}`),

  setStatus: (id: string, status: OrderStatus) =>
    request<{ order: OrderRecord }>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  uploadDeliverable: (id: string, kind: DeliverableKind, file: { name: string; size: number }) =>
    request<{ order: OrderRecord }>(`/api/orders/${id}/files`, json({ kind, ...file })),

  removeDeliverable: (id: string, kind: DeliverableKind) =>
    request<{ order: OrderRecord }>(`/api/orders/${id}/files`, { method: "DELETE", body: JSON.stringify({ kind }) }),
};
