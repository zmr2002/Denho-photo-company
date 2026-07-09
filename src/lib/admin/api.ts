import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { requireAdminApiSession } from "@/lib/auth/session";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function authorizeAdminApi() {
  const session = await requireAdminApiSession();
  if (!session?.user?.id) {
    return { response: jsonError("需要登录。", 401), session: null };
  }
  return { response: null, session };
}

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>) {
  try {
    const json = await request.json();
    return { data: schema.parse(json), response: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null, response: jsonError("验证失败。", 422, error.flatten()) };
    }
    return { data: null, response: jsonError("JSON 内容无效。", 400) };
  }
}

export function handleRouteError(error: unknown) {
  console.error(error);
  return jsonError("后台请求失败。", 500);
}
