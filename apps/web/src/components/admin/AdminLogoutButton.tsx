"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminResponseMessage, writeAdminApi } from "@/lib/api/browser";

export function AdminLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setPending(true);
    setError("");
    const response = await writeAdminApi("/api/v1/auth/logout", "POST", {});
    if (!response.ok && response.status !== 401) {
      setPending(false);
      setError(adminResponseMessage(response, "退出失败，请稍后重试。"));
      return;
    }
    router.push("/studio-tianho/login");
    router.refresh();
  }

  return (
    <div>
      <button className="admin-muted-link" disabled={pending} onClick={logout} type="button">
        {pending ? "退出中" : "退出登录"}
      </button>
      {error ? <p className="admin-error" role="alert">{error}</p> : null}
    </div>
  );
}
