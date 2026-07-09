import { NextResponse } from "next/server";
import { authorizeAdminApi, handleRouteError, parseJsonBody } from "@/lib/admin/api";
import { noticeMutationSchema, nullable, optionalDate } from "@/lib/admin/validation";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  try {
    const notices = await prisma.openingNotice.findMany({
      orderBy: { locale: "asc" },
    });
    return NextResponse.json({ notices });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  const parsed = await parseJsonBody(request, noticeMutationSchema);
  if (parsed.response) return parsed.response;

  const data = parsed.data;

  try {
    const notice = await prisma.openingNotice.upsert({
      where: { locale: data.locale },
      create: {
        locale: data.locale,
        enabled: data.enabled,
        label: data.label,
        title: data.title,
        body: data.body,
        dismissLabel: data.dismissLabel,
        linkLabel: nullable(data.linkLabel),
        linkHref: nullable(data.linkHref),
        storageKey: data.storageKey,
        dismissalMode: data.dismissalMode,
        status: data.status,
        startAt: optionalDate(data.startAt),
        endAt: optionalDate(data.endAt),
      },
      update: {
        enabled: data.enabled,
        label: data.label,
        title: data.title,
        body: data.body,
        dismissLabel: data.dismissLabel,
        linkLabel: nullable(data.linkLabel),
        linkHref: nullable(data.linkHref),
        storageKey: data.storageKey,
        dismissalMode: data.dismissalMode,
        status: data.status,
        startAt: optionalDate(data.startAt),
        endAt: optionalDate(data.endAt),
      },
    });

    return NextResponse.json({ notice });
  } catch (error) {
    return handleRouteError(error);
  }
}
