import { respond } from "@/lib/api-response";
import { markPaid } from "@/services/orders";

/** Confirms order payment and updates Supabase database. */
export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return respond(await markPaid(id), (order) => ({ order }));
}
