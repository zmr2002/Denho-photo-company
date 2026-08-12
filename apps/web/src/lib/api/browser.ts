import createClient from "openapi-fetch";
import type { paths } from "@/api-contract/api-schema";

const apiClient = createClient<paths>({ credentials: "same-origin" });

export async function getCsrfHeaders() {
  try {
    const csrfResult = await apiClient.GET("/api/v1/auth/csrf", {});
    if (!csrfResult.response.ok || !csrfResult.data?.headerName || !csrfResult.data.token) return null;
    return { [csrfResult.data.headerName]: csrfResult.data.token };
  } catch {
    return null;
  }
}

export async function writeAdminApi(path: string, method: "POST" | "PATCH", body: unknown) {
  const csrfHeaders = await getCsrfHeaders();
  if (!csrfHeaders) return new Response(null, { status: 503 });
  try {
    return await fetch(path, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...csrfHeaders },
      body: JSON.stringify(body),
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}

export function adminResponseMessage(response: Response, fallback: string) {
  if (response.status === 401) return "登录已过期。请重新登录，当前页面内容仍会保留。";
  if (response.status === 403) return "当前账号没有执行此操作的权限。";
  if (response.status === 409) return "内容已被其他操作更新。请刷新页面，确认最新内容后再保存。";
  if (response.status === 400 || response.status === 422) return "部分内容不符合要求，请检查标记的字段。";
  if (response.status === 503) return "暂时无法连接服务。请检查网络后重试。";
  return fallback;
}
