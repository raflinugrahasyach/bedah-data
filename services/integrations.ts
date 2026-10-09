import { env } from "@/lib/env";
import type { OrderRecord } from "@/lib/types";

export interface MidtransPayment {
  token: string;
  redirectUrl?: string;
}

export function createMidtransPayment(order: Pick<OrderRecord, "code" | "totalPrice">): MidtransPayment {
  return {
    token: `snap-${order.code.toLowerCase()}-${Date.now().toString(36)}`,
  };
}

export interface N8nDelivery {
  workflow: string;
  delivered: boolean;
}

export async function notifyN8n(
  event: "order.created" | "order.status_changed" | "order.paid" | "order.delivered" | "order.call_booked",
  payload?: Record<string, unknown>,
): Promise<N8nDelivery> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const workflow = `bedah-data/${event}`;

  if (webhookUrl && !webhookUrl.includes("mock")) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          workflow,
          timestamp: new Date().toISOString(),
          ...payload,
        }),
      });
      return { workflow, delivered: true };
    } catch (err) {
      console.error("[services/integrations] n8n webhook error:", err);
      return { workflow, delivered: false };
    }
  }

  return { workflow, delivered: true };
}

export interface CalcomBooking {
  url: string;
  startsAt: string;
  durationMinutes: number;
}

/** Next weekday at 10:00 WIB (03:00 UTC), at least a day from now. */
export function createCalcomBooking(): CalcomBooking {
  const slot = new Date();
  slot.setUTCDate(slot.getUTCDate() + 1);
  while ([0, 6].includes(slot.getUTCDay())) slot.setUTCDate(slot.getUTCDate() + 1);
  slot.setUTCHours(3, 0, 0, 0);

  const calLink =
    process.env.NEXT_PUBLIC_CALCOM_LINK ||
    env.calcomLink ||
    "https://cal.com/muhammad-rafli-nugrahasyach-wcctyc/konsultasi";

  return { url: calLink, startsAt: slot.toISOString(), durationMinutes: 15 };
}
