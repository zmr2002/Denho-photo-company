import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminSession as readAdminSession } from "@/lib/api/admin";
import { administrationLoginPath } from "@/lib/auth/return-path";

export async function getAdminSession() {
  return readAdminSession();
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session.authenticated || !session.userId) {
    redirect(administrationLoginPath((await headers()).get("x-admin-return-path")));
  }
  return session;
}
