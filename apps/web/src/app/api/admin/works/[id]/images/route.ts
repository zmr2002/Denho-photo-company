import { NextResponse } from "next/server";
import { authorizeAdminApi, handleRouteError, jsonError, parseJsonBody } from "@/lib/admin/api";
import { nullable, workImagesMutationSchema } from "@/lib/admin/validation";
import { prisma } from "@/lib/db/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  const { id } = await context.params;

  try {
    const work = await prisma.work.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    if (!work) return jsonError("作品不存在。", 404);
    return NextResponse.json({ work });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const parsed = await parseJsonBody(request, workImagesMutationSchema);
  if (parsed.response) return parsed.response;

  const data = parsed.data;

  try {
    const existing = await prisma.work.findUnique({ where: { id } });
    if (!existing) return jsonError("作品不存在。", 404);

    const mediaType = data.mediaType || existing.mediaType;
    const galleryEnabled = mediaType === "video" ? false : data.galleryEnabled;
    const coverIndex = data.images.findIndex((image) => image.isCover);

    const work = await prisma.$transaction(async (tx) => {
      await tx.workImage.deleteMany({ where: { workId: id } });

      return tx.work.update({
        where: { id },
        data: {
          mediaType,
          galleryEnabled,
          images: {
            create: data.images.map((image, index) => ({
              path: image.path,
              label: image.label,
              tone: image.tone,
              altJa: nullable(image.altJa),
              altZh: nullable(image.altZh),
              altEn: nullable(image.altEn),
              captionJa: nullable(image.captionJa),
              captionZh: nullable(image.captionZh),
              captionEn: nullable(image.captionEn),
              isCover: coverIndex >= 0 ? index === coverIndex : index === 0,
              sortOrder: image.sortOrder ?? index,
            })),
          },
        },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      });
    });

    return NextResponse.json({ work });
  } catch (error) {
    return handleRouteError(error);
  }
}
