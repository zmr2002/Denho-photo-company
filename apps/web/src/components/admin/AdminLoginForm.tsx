"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { writeAdminApi } from "@/lib/api/browser";

type LoginChallenge = { challengeId: string; setupRequired: boolean };
type Binding = { secret: string; provisioningUri: string };

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [binding, setBinding] = useState<Binding | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await writeAdminApi("/api/v1/auth/login", "POST", { email, password });
    if (!response.ok) {
      setSubmitting(false);
      setError("邮箱或密码不正确，或账号暂时被锁定。");
      return;
    }
    const nextChallenge = (await response.json()) as LoginChallenge;
    setChallenge(nextChallenge);
    setPassword("");
    if (nextChallenge.setupRequired) {
      const bindingResponse = await writeAdminApi("/api/v1/auth/mfa/bind", "POST", { challengeId: nextChallenge.challengeId });
      if (!bindingResponse.ok) setError("无法开始账号验证，请重新登录。");
      else setBinding((await bindingResponse.json()) as Binding);
    }
    setSubmitting(false);
  }

  async function submitCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;
    setSubmitting(true);
    setError("");
    const response = useRecovery
      ? await writeAdminApi("/api/v1/auth/mfa/recovery", "POST", { challengeId: challenge.challengeId, recoveryCode })
      : await writeAdminApi("/api/v1/auth/mfa/verify", "POST", { challengeId: challenge.challengeId, code });
    setSubmitting(false);
    if (!response.ok) {
      setError(useRecovery ? "恢复码无效、已使用或已过期。" : "验证码无效或已过期，请重试。");
      return;
    }
    const result = (await response.json()) as { recoveryCodes: string[] };
    if (result.recoveryCodes.length > 0) setRecoveryCodes(result.recoveryCodes);
    else finishLogin();
  }

  function finishLogin() {
    router.push("/studio-tianho");
    router.refresh();
  }

  if (recoveryCodes.length > 0) {
    return (
      <section className="admin-form">
        <h2>请保存恢复码</h2>
        <p className="admin-help">每个恢复码只能使用一次。请保存在密码管理器中，离开本页后不会再次显示。</p>
        <ul>{recoveryCodes.map((item) => <li key={item}><code>{item}</code></li>)}</ul>
        <button className="admin-button" onClick={finishLogin} type="button">我已安全保存</button>
      </section>
    );
  }

  if (challenge) {
    return (
      <form className="admin-form" onSubmit={submitCode}>
        {binding ? <div className="admin-info-box"><strong>首次绑定验证器</strong><p>在验证器应用中添加以下密钥，然后输入六位验证码。</p><code>{binding.secret}</code></div> : null}
        {useRecovery ? (
          <label className="admin-field"><span className="admin-label">恢复码</span><input autoComplete="one-time-code" onChange={(event) => setRecoveryCode(event.target.value)} pattern="[A-Za-z2-7]{4}-[A-Za-z2-7]{4}-[A-Za-z2-7]{4}" required value={recoveryCode} /></label>
        ) : (
          <label className="admin-field"><span className="admin-label">六位验证码</span><input autoComplete="one-time-code" inputMode="numeric" maxLength={6} onChange={(event) => setCode(event.target.value)} pattern="[0-9]{6}" required value={code} /></label>
        )}
        {error ? <p className="admin-error">{error}</p> : null}
        <button className="admin-button" disabled={submitting} type="submit">{submitting ? "验证中" : "验证并登录"}</button>
        {!binding ? <button className="admin-muted-link" onClick={() => setUseRecovery((current) => !current)} type="button">{useRecovery ? "使用六位验证码" : "使用恢复码"}</button> : null}
      </form>
    );
  }

  return (
    <form className="admin-form" onSubmit={submitPassword}>
      <label className="admin-field"><span className="admin-label">邮箱</span><input autoComplete="email" name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
      <label className="admin-field"><span className="admin-label">密码</span><input autoComplete="current-password" name="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
      {error ? <p className="admin-error">{error}</p> : null}
      <button className="admin-button" disabled={submitting} type="submit">{submitting ? "登录中" : "登录"}</button>
    </form>
  );
}
