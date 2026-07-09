import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    redirect("/studio-tianho/login");
  }
  return session;
}

export async function requireAdminApiSession() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}
