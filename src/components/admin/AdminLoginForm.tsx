"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@tianho.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.ok) {
      router.push("/studio-tianho");
      router.refresh();
      return;
    }

    setError("管理员邮箱或密码不正确。");
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
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
