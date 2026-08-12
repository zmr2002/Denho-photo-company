"use client";

import Link from "next/link";

export default function AdministrationError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <main className="admin-login-page" lang="zh">
      <section className="admin-login-panel" role="alert">
        <div>
          <p className="admin-kicker">管理后台</p>
          <h1 className="admin-login-title">页面暂时无法载入</h1>
          <p className="admin-user">登录可能已过期，或本地 API 尚未启动。重新登录不会公开或删除现有内容。</p>
        </div>
        <div className="admin-actions">
          <button className="admin-button" onClick={() => unstable_retry()} type="button">重试</button>
          <Link className="admin-button-secondary" href="/studio-tianho/login">重新登录</Link>
        </div>
      </section>
    </main>
  );
}
