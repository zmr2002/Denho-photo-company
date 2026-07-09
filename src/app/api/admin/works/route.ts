import { NextResponse } from "next/server";
import { authorizeAdminApi, handleRouteError } from "@/lib/admin/api";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  try {
    const works = await prisma.work.findMany({
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ locale: "asc" }, { featuredOrder: "asc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ works });
  } catch (error) {
    return handleRouteError(error);
  }
}
