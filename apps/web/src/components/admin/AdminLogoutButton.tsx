"use client";

import { useRouter } from "next/navigation";
import { writeAdminApi } from "@/lib/api/browser";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await writeAdminApi("/api/v1/auth/logout", "POST", {});
    router.push("/studio-tianho/login");
    router.refresh();
  }

  return <button className="admin-muted-link" onClick={logout} type="button">退出登录</button>;
}
