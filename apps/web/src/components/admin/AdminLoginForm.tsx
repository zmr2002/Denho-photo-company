"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminResponseMessage, writeAdminApi } from "@/lib/api/browser";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await writeAdminApi("/api/v1/auth/login", "POST", { email, password });
    if (!response.ok) {
      setSubmitting(false);
      setError(response.status === 401
        ? "邮箱或密码不正确，或账号暂时被锁定。"
        : adminResponseMessage(response, "登录失败，请稍后重试。"));
      return;
    }

    setSubmitting(false);
    router.push("/studio-tianho");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={submitLogin}>
      <label className="admin-field">
        <span className="admin-label">邮箱</span>
        <input
          autoComplete="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="admin-field">
        <span className="admin-label">密码</span>
        <input
          autoComplete="current-password"
          minLength={8}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
      <button className="admin-button" disabled={submitting} type="submit">
        {submitting ? "登录中" : "登录"}
      </button>
    </form>
  );
}
