import { z } from "zod";
import { parseBody, respond } from "@/lib/api-response";
import { createOrder, listOrders } from "@/services/orders";
import { NextResponse } from "next/server";

const createOrderSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120),
  email: z.email("Format email belum benar."),
  brief: z.object({
    objective: z.string().trim().min(12, "Tujuan penelitian belum lengkap.").max(700),
    variables: z.object({
      summary: z.string().max(700),
      independent: z.array(z.string().max(160)).max(8),
      dependent: z.array(z.string().max(160)).max(8),
    }),
    dataProfile: z.string().trim().min(8, "Profil data belum lengkap.").max(1000),
    method: z.string().trim().min(3, "Metode belum dipilih.").max(700),
  }),
});

export async function GET() {
  return NextResponse.json({ orders: listOrders() });
}

/** Submits a completed brief: creates the client, order, brief, and work item (mock Midtrans token included). */
export async function POST(request: Request) {
  const parsed = await parseBody(request, createOrderSchema);
  if (parsed.error) return parsed.error;
  return respond(createOrder(parsed.data), undefined, 201);
}
