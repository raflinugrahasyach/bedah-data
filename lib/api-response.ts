import { NextResponse } from "next/server";
import { z } from "zod";
import type { ServiceResult } from "@/services/orders";

export type ApiErrorBody = { error: { code: string; message: string } };

export function jsonError(code: string, message: string, status: number) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message } }, { status });
}

const STATUS_BY_CODE = { not_found: 404, invalid: 422, conflict: 409 } as const;

/** Maps a service result onto an HTTP response (`map` shapes the success body). */
export function respond<T, R = T>(result: ServiceResult<T>, map?: (data: T) => R, successStatus = 200) {
  if (!result.ok) return jsonError(result.error.code, result.error.message, STATUS_BY_CODE[result.error.code]);
  return NextResponse.json(map ? map(result.data) : result.data, { status: successStatus });
}

/** Parses a JSON body with zod; returns either the data or a ready 400 response. */
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<{ data: z.infer<S>; error?: undefined } | { data?: undefined; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: jsonError("bad_request", "Isi permintaan bukan JSON yang valid.", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.length ? ` (${first.path.join(".")})` : "";
    return { error: jsonError("bad_request", `${first?.message ?? "Data tidak valid."}${where}`, 400) };
  }
  return { data: parsed.data };
}
