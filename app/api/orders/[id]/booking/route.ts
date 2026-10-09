import { respond } from "@/lib/api-response";
import { bookCall } from "@/services/orders";

/** Simulates creating a Cal.com booking for the 15-minute consultation call. */
export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return respond(bookCall(id));
}
