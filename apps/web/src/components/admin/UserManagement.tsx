"use client";

import { useState } from "react";
import { AdminActionFeedback, useAdministrationAction } from "@/components/admin/AdminActionFeedback";
import { adminResponseMessage, writeAdminApi } from "@/lib/api/browser";
import type { AdministratorUser } from "@/lib/api/admin";

export function UserManagement({ currentUserId, initialUsers }: { currentUserId: string; initialUsers: AdministratorUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdministratorUser["role"]>("EDITOR");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { feedback, pending, run, showError, showSuccess } = useAdministrationAction();

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    await run(async () => {
      const response = await writeAdminApi("/api/v1/admin/users", "POST", { email, displayName, password, role });
      if (!response.ok) {
        showError(adminResponseMessage(response, "无法创建账号，请确认邮箱没有重复。"));
        return;
      }
      const created = await response.json() as AdministratorUser;
      setUsers((current) => [...current, created]);
      setEmail("");
      setDisplayName("");
      setPassword("");
      setRole("EDITOR");
      showSuccess("账号已创建，请将初始密码通过安全方式交给本人。");
    });
  }

  async function updateUser(user: AdministratorUser, change: { role?: AdministratorUser["role"]; active?: boolean }) {
    const description = change.role ? `将 ${user.displayName} 改为${change.role === "ADMIN" ? "管理员" : "编辑"}` : `${change.active ? "启用" : "停用"} ${user.displayName}`;
    if (!window.confirm(`确定要${description}吗？该账号的现有登录状态可能会被结束。`)) return;
    await run(async () => {
      setPendingId(user.id);
      const path = change.role ? `/api/v1/admin/users/${user.id}/role` : `/api/v1/admin/users/${user.id}/status`;
      const body = change.role ? { role: change.role } : { active: change.active };
      const response = await writeAdminApi(path, "PATCH", body);
      setPendingId(null);
      if (!response.ok) {
        showError(adminResponseMessage(response, "无法更新账号，请稍后重试。"));
        return;
      }
      const updated = await response.json() as AdministratorUser;
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      showSuccess("账号设置已更新。");
    });
  }

  return (
    <div className="admin-user-workspace">
      <section className="admin-card">
        <div className="admin-card-heading"><div><p className="admin-kicker">新增成员</p><h3>创建后台账号</h3></div></div>
        <form className="admin-form" onSubmit={createUser}>
          <div className="admin-form-grid">
            <label className="admin-field"><span className="admin-label">显示名称</span><input maxLength={160} onChange={(event) => setDisplayName(event.target.value)} required value={displayName} /></label>
            <label className="admin-field"><span className="admin-label">邮箱</span><input onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
            <label className="admin-field"><span className="admin-label">初始密码</span><input minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /><span className="admin-help">至少 8 位，仅通过安全方式交给本人。</span></label>
          </div>
          <label className="admin-field admin-status-field"><span className="admin-label">角色</span><select onChange={(event) => setRole(event.target.value as AdministratorUser["role"])} value={role}><option value="EDITOR">编辑</option><option value="ADMIN">管理员</option></select></label>
          <div className="admin-actions"><button className="admin-button" disabled={pending} type="submit">{pending ? "创建中" : "创建账号"}</button><AdminActionFeedback feedback={feedback} /></div>
        </form>
      </section>

      <section className="admin-list" aria-label="后台账号">
        {users.map((user) => {
          const isCurrent = user.id === currentUserId;
          return (
            <article className="admin-list-row admin-user-row" key={user.id}>
              <div>
                <p className="admin-label">{user.role === "ADMIN" ? "管理员" : "编辑"} · {user.active ? "可登录" : "已停用"}</p>
                <h3>{user.displayName}{isCurrent ? "（当前账号）" : ""}</h3>
                <p>{user.email}</p>
                <small>{user.verifiedAt ? "验证器已绑定" : "等待首次验证"} · {user.lastLoginAt ? `最后登录 ${new Date(user.lastLoginAt).toLocaleString("zh-CN")}` : "尚未登录"}</small>
              </div>
              {!isCurrent ? (
                <div className="admin-actions">
                  <button className="admin-button-secondary" disabled={pendingId === user.id} onClick={() => updateUser(user, { role: user.role === "ADMIN" ? "EDITOR" : "ADMIN" })} type="button">设为{user.role === "ADMIN" ? "编辑" : "管理员"}</button>
                  <button className={user.active ? "admin-danger" : "admin-button-secondary"} disabled={pendingId === user.id} onClick={() => updateUser(user, { active: !user.active })} type="button">{user.active ? "停用账号" : "重新启用"}</button>
                </div>
              ) : <span className="admin-help">不能在此修改自己的角色或停用自己</span>}
            </article>
          );
        })}
      </section>
    </div>
  );
}
