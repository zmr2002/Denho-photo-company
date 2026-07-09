import { hash } from "bcryptjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";

const locales = ["ja", "zh", "en"] as const;

const localeText = {
  ja: {
    noticeLabel: "Notice JA",
    category: "Notice JA",
    articleCategory: "Production Note JA",
    workCategory: "Event / Space JA",
    galleryWork: "Gallery test work JA",
    photoWork: "Photo test work JA",
    videoWork: "Video test work JA",
  },
  zh: {
    noticeLabel: "Notice ZH",
    category: "Notice ZH",
    articleCategory: "Production Note ZH",
    workCategory: "Event / Space ZH",
    galleryWork: "Gallery test work ZH",
    photoWork: "Photo test work ZH",
    videoWork: "Video test work ZH",
  },
  en: {
    noticeLabel: "Notice",
    category: "Notice",
    articleCategory: "Production Note",
    workCategory: "Event / Space",
    galleryWork: "Gallery test work",
    photoWork: "Photo test work",
    videoWork: "Video test work",
  },
};

function jsonList(items: string[]) {
  return JSON.stringify(items);
}

async function main() {
  bootstrapLocalSqlite();

  const prisma = new PrismaClient();
  const email = process.env.ADMIN_SEED_EMAIL || "admin@tianho.local";
  const password = process.env.ADMIN_SEED_PASSWORD || "local-admin-change-me";
  const passwordHash = await hash(password, 12);

  try {
    await prisma.workImage.deleteMany();
    await prisma.work.deleteMany();
    await prisma.openingNotice.deleteMany();
    await prisma.articleBlock.deleteMany();
    await prisma.article.deleteMany();
    await prisma.adminUser.deleteMany();

  const admin = await prisma.adminUser.create({
    data: {
      email,
      name: "Local Admin",
      passwordHash,
      role: "admin",
    },
  });

  for (const locale of locales) {
    const text = localeText[locale];

    await prisma.openingNotice.create({
      data: {
        locale,
        enabled: true,
        label: text.noticeLabel,
        title: "test",
        body: "testcontext",
        dismissLabel: "Dismiss",
        storageKey: `tianho-opening-notice-${locale}-local`,
        dismissalMode: "session",
        status: "published",
        startAt: new Date("2026-07-01T00:00:00.000Z"),
      },
    });

    await prisma.article.create({
      data: {
        locale,
        slug: "test",
        title: "test",
        excerpt: "testcontext",
        category: text.category,
        authorName: "Local Admin",
        heroLabel: "test",
        heroImagePath: `/placeholders/${locale}-article-test.svg`,
        heroAlt: "test",
        heroTone: "cool",
        closingNote: "testcontext",
        status: "published",
        publishedAt: new Date("2026-07-01T00:00:00.000Z"),
        displayOrder: 1,
        relatedServices: jsonList(["local CMS test"]),
        seoTitle: "test",
        seoDescription: "testcontext",
        updatedById: admin.id,
        blocks: {
          create: [
            {
              type: "paragraph",
              body: "testcontext",
              sortOrder: 1,
            },
          ],
        },
      },
    });

    await prisma.article.create({
      data: {
        locale,
        slug: "production-planning",
        title: `Local production planning ${locale.toUpperCase()}`,
        excerpt:
          `CMS-backed article used for local ${locale} verification.`,
        category: text.articleCategory,
        authorName: "Local Admin",
        heroLabel: "Production planning",
        heroImagePath: `/placeholders/${locale}-article-production-planning.svg`,
        heroAlt: "Production planning",
        heroTone: "warm",
        status: "published",
        publishedAt: new Date("2026-07-02T00:00:00.000Z"),
        displayOrder: 2,
        relatedServices: jsonList(["Event Production", "Web Production"]),
        seoTitle: `Local production planning ${locale.toUpperCase()}`,
        seoDescription: "CMS-backed article used for local verification.",
        updatedById: admin.id,
        blocks: {
          create: [
            {
              type: "heading",
              heading: `Before production ${locale.toUpperCase()}`,
              sortOrder: 1,
            },
            {
              type: "paragraph",
              body:
                locale === "en"
                  ? "This record confirms that public article pages can render content from the local database."
                  : `This ${locale} record confirms that public article pages can render content from the local database.`,
              sortOrder: 2,
            },
          ],
        },
      },
    });

    const works = [
      { slug: "gallery-test", title: text.galleryWork, mediaType: "gallery", galleryEnabled: true, featuredOrder: 1 },
      { slug: "photo-test", title: text.photoWork, mediaType: "photo", galleryEnabled: false, featuredOrder: 2 },
      { slug: "video-test", title: text.videoWork, mediaType: "video", galleryEnabled: false, featuredOrder: 3 },
    ];

    for (const work of works) {
      await prisma.work.create({
        data: {
          locale,
          slug: work.slug,
          title: work.title,
          summary:
            locale === "en"
              ? "Local database work entry for admin and public rendering verification."
              : `Local database ${locale} work entry for admin and public rendering verification.`,
          clientName: "Local Client",
          projectDate: "2026",
          category: text.workCategory,
          serviceCategory: work.mediaType === "gallery" ? "event" : work.mediaType === "photo" ? "space" : "video",
          scope: "Photo / Film / Gallery",
          challenge: "Confirm local CMS-backed work rendering.",
          approach: jsonList(["Create local database content", "Edit gallery image metadata", "Render through public adapter"]),
          outcome: "The work entry can be edited locally before production storage is decided.",
          deliverables: jsonList(["Admin record", "Public card", "Gallery metadata"]),
          status: "published",
          featuredOnHomepage: true,
          featuredOrder: work.featuredOrder,
          mediaType: work.mediaType,
          galleryEnabled: work.galleryEnabled,
          seoTitle: work.title,
          seoDescription: "Local database work entry for verification.",
          youtubeUrl: work.mediaType === "video" ? "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" : null,
          images: {
            create: [1, 2, 3].map((index) => ({
              path: `/placeholders/${locale}-${work.slug}-${index}.svg`,
              label: `${work.title} ${index}`,
              tone: index === 1 ? "rust" : index === 2 ? "warm" : "cool",
              altJa: `${work.title} ${index}`,
              altZh: `${work.title} ${index}`,
              altEn: `${work.title} ${index}`,
              captionJa: `${work.title} ${index}`,
              captionZh: `${work.title} ${index}`,
              captionEn: `${work.title} ${index}`,
              isCover: index === 1,
              sortOrder: index,
            })),
          },
        },
      });
    }
  }
  } finally {
    await prisma.$disconnect();
  }
}

function bootstrapLocalSqlite() {
  const dbPath = resolve("prisma", "dev.db");
  const migrationPath = resolve("prisma", "migrations", "20260709000000_init_custom_admin_local_mvp", "migration.sql");
  const heroPathMigrationPath = resolve("prisma", "migrations", "20260709001000_add_article_hero_image_path", "migration.sql");
  const migrationSql = readFileSync(migrationPath, "utf8");
  const heroPathMigrationSql = readFileSync(heroPathMigrationPath, "utf8");
  const db = new DatabaseSync(dbPath);

  try {
    db.exec(migrationSql);
    try {
      db.exec(heroPathMigrationSql);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("duplicate column")) {
        throw error;
      }
    }
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
