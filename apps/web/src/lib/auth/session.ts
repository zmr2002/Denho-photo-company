import { redirect } from "next/navigation";
import { getAdminSession as readAdminSession } from "@/lib/api/admin";

export async function getAdminSession() {
  return readAdminSession();
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session.authenticated || !session.userId) {
    redirect("/studio-tianho/login");
  }
  return session;
}
