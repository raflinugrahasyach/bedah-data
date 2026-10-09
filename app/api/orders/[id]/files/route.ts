import { z } from "zod";
import { parseBody, respond } from "@/lib/api-response";
import { DELIVERABLE_KINDS } from "@/lib/types";
import { attachDeliverable, removeDeliverable } from "@/services/orders";

const uploadSchema = z.object({
  kind: z.enum(DELIVERABLE_KINDS),
  name: z.string().min(1).max(255),
  size: z.number().int().positive(),
});

const deleteSchema = z.object({
  kind: z.enum(DELIVERABLE_KINDS),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const parsed = await parseBody(request, uploadSchema);
  if (parsed.error) return parsed.error;
  return respond(
    attachDeliverable(id, parsed.data.kind, {
      name: parsed.data.name,
      size: parsed.data.size,
    }),
    (order) => ({ order }),
    201,
  );
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const parsed = await parseBody(request, deleteSchema);
  if (parsed.error) return parsed.error;
  return respond(removeDeliverable(id, parsed.data.kind), (order) => ({ order }));
}
