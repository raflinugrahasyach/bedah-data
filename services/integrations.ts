import { env } from "@/lib/env";
import type { OrderRecord } from "@/lib/types";

/**
 * Placeholder integrations. Each function returns what the real provider would
 * hand back, flagged `mock: true`, so every screen is clickable without keys.
 * Swap the bodies for the real Midtrans / n8n / Cal.com calls later.
 */

export interface MidtransPayment {
  token: string;
  mock: true;
}

export function createMidtransPayment(order: Pick<OrderRecord, "code" | "totalPrice">): MidtransPayment {
  return { token: `mock-snap-${order.code.toLowerCase()}`, mock: true };
}

export interface N8nDelivery {
  workflow: string;
  delivered: true;
  mock: true;
}

export function notifyN8n(event: "order.created" | "order.status_changed" | "order.paid" | "order.delivered"): N8nDelivery {
  return { workflow: `bedah-data/${event}`, delivered: true, mock: true };
}

export interface CalcomBooking {
  url: string;
  startsAt: string;
  durationMinutes: number;
  mock: true;
}

/** Next weekday at 10:00 WIB (03:00 UTC), at least a day from now. */
export function createCalcomBooking(): CalcomBooking {
  const slot = new Date();
  slot.setUTCDate(slot.getUTCDate() + 1);
  while ([0, 6].includes(slot.getUTCDay())) slot.setUTCDate(slot.getUTCDate() + 1);
  slot.setUTCHours(3, 0, 0, 0);
  return { url: env.calcomLink, startsAt: slot.toISOString(), durationMinutes: 15, mock: true };
}
