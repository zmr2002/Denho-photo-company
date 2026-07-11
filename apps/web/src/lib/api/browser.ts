import createClient from "openapi-fetch";
import type { paths } from "@/generated/api-schema";

const apiClient = createClient<paths>({ credentials: "same-origin" });

export async function getCsrfHeaders() {
  const csrfResult = await apiClient.GET("/api/v1/auth/csrf", {});
  if (!csrfResult.response.ok || !csrfResult.data?.headerName || !csrfResult.data.token) return null;
  return { [csrfResult.data.headerName]: csrfResult.data.token };
}

export async function writeAdminApi(path: string, method: "POST" | "PATCH", body: unknown) {
  const csrfHeaders = await getCsrfHeaders();
  if (!csrfHeaders) return new Response(null, { status: 503 });
  return fetch(path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...csrfHeaders },
    body: JSON.stringify(body),
  });
}
