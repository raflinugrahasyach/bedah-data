import { z } from "zod";
import { parseBody, respond } from "@/lib/api-response";
import { ORDER_STATUSES } from "@/lib/types";
import { getOrder, setOrderStatus } from "@/services/orders";

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return respond(await getOrder(id), (order) => ({ order }));
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const parsed = await parseBody(request, patchSchema);
  if (parsed.error) return parsed.error;
  return respond(await setOrderStatus(id, parsed.data.status), (order) => ({ order }));
}
