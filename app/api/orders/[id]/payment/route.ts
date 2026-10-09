import { respond } from "@/lib/api-response";
import { markPaid } from "@/services/orders";

/** Simulates the Midtrans payment webhook confirming the order is paid. */
export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return respond(markPaid(id), (order) => ({ order }));
}
