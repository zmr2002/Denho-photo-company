import { NextResponse } from "next/server";
import { authorizeAdminApi, handleRouteError, jsonError, parseJsonBody } from "@/lib/admin/api";
import { articleMutationSchema, nullable, optionalDate } from "@/lib/admin/validation";
import { prisma } from "@/lib/db/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  const { id } = await context.params;

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
    });

    if (!article) return jsonError("Article not found.", 404);
    return NextResponse.json({ article });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const parsed = await parseJsonBody(request, articleMutationSchema);
  if (parsed.response) return parsed.response;

  const data = parsed.data;

  try {
    const article = await prisma.$transaction(async (tx) => {
      await tx.articleBlock.deleteMany({ where: { articleId: id } });

      return tx.article.update({
        where: { id },
        data: {
          locale: data.locale,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          category: data.category,
          authorName: data.authorName,
          heroLabel: nullable(data.heroLabel),
          heroImagePath: nullable(data.heroImagePath),
          heroAlt: nullable(data.heroAlt),
          heroTone: data.heroTone,
          heroCaption: nullable(data.heroCaption),
          closingNote: nullable(data.closingNote),
          ctaLabel: nullable(data.ctaLabel),
          ctaHref: nullable(data.ctaHref),
          status: data.status,
          publishedAt: data.status === "published" ? optionalDate(data.publishedAt) || new Date() : null,
          displayOrder: data.displayOrder,
          relatedServices: JSON.stringify(data.relatedServices),
          seoTitle: nullable(data.seoTitle),
          seoDescription: nullable(data.seoDescription),
          youtubeUrl: nullable(data.youtubeUrl),
          updatedById: auth.session?.user?.id,
          blocks: {
            create: data.blocks.map((block, index) => ({
              type: block.type,
              heading: nullable(block.heading),
              body: nullable(block.body),
              imagePath: nullable(block.imagePath),
              imageAlt: nullable(block.imageAlt),
              imageTone: block.imageTone,
              caption: nullable(block.caption),
              sortOrder: block.sortOrder ?? index,
            })),
          },
        },
        include: { blocks: { orderBy: { sortOrder: "asc" } } },
      });
    });

    return NextResponse.json({ article });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  const { id } = await context.params;

  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
