import createClient from "openapi-fetch";
import type { paths } from "@/generated/api-schema";

const apiClient = createClient<paths>({ credentials: "same-origin" });

export async function writeAdminApi(path: string, method: "POST" | "PATCH", body: unknown) {
  const csrfResult = await apiClient.GET("/api/v1/auth/csrf", {});
  if (!csrfResult.response.ok || !csrfResult.data?.headerName || !csrfResult.data.token) return csrfResult.response;
  return fetch(path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", [csrfResult.data.headerName]: csrfResult.data.token },
    body: JSON.stringify(body),
  });
}
