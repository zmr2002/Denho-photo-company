import { NextResponse } from "next/server";
import { authorizeAdminApi, handleRouteError, parseJsonBody } from "@/lib/admin/api";
import { articleMutationSchema, nullable, optionalDate } from "@/lib/admin/validation";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  try {
    const articles = await prisma.article.findMany({
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ locale: "asc" }, { displayOrder: "asc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ articles });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  const auth = await authorizeAdminApi();
  if (auth.response) return auth.response;

  const parsed = await parseJsonBody(request, articleMutationSchema);
  if (parsed.response) return parsed.response;

  const data = parsed.data;

  try {
    const article = await prisma.article.create({
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

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
