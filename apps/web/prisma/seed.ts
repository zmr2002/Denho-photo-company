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

const tutorialArticle = {
  locale: "zh",
  slug: "admin-tutorial-sample",
  title: "后台教学示例：如何编辑一篇制作案例文章",
  excerpt: "这是一篇用于后台操作说明的示例文章，展示标题、摘要、图片、正文段落和结尾说明的使用方式。",
  lead: "您可以参考这篇文章，了解如何填写一篇正式的制作案例或公告文章。",
  category: "后台教学",
  heroImagePath: "/placeholders/zh-article-production-planning.svg",
  heroAlt: "示例主图：拍摄现场或制作项目的代表图片",
  heroCaption: "主图说明会显示在文章图片附近，用于补充图片背景。",
  closingNote: "这是公开演示用教学示例，用于说明文章结构；正式上线前可根据需要改回草稿或删除。",
};

async function main() {
  bootstrapLocalSqlite();

  const prisma = new PrismaClient();
  try {
    await prisma.workImage.deleteMany();
    await prisma.work.deleteMany();
    await prisma.openingNotice.deleteMany();
    await prisma.articleBlock.deleteMany();
    await prisma.article.deleteMany();

  await prisma.article.create({
    data: {
      locale: tutorialArticle.locale,
      slug: tutorialArticle.slug,
      title: tutorialArticle.title,
      excerpt: tutorialArticle.excerpt,
      category: tutorialArticle.category,
      authorName: "后台教学示例",
      heroLabel: "教学示例主图",
      heroImagePath: tutorialArticle.heroImagePath,
      heroAlt: tutorialArticle.heroAlt,
      heroTone: "cool",
      heroCaption: tutorialArticle.heroCaption,
      closingNote: tutorialArticle.closingNote,
      status: "published",
      publishedAt: new Date("2026-07-03T00:00:00.000Z"),
      displayOrder: 0,
      relatedServices: jsonList(["文章管理", "制作案例", "公告内容"]),
      seoTitle: tutorialArticle.title,
      seoDescription: tutorialArticle.excerpt,
      blocks: {
        create: [
          {
            type: "paragraph",
            body: tutorialArticle.lead,
            sortOrder: 1,
          },
          {
            type: "heading",
            heading: "1. 文章标题和摘要的写法",
            sortOrder: 2,
          },
          {
            type: "paragraph",
            body:
              "标题是文章最主要的名称，会出现在文章页面和后台列表中。摘要是列表中显示的一小段介绍，适合用一到两句话说明这篇文章的重点。导语可以放在正文第一段，用来告诉读者为什么要继续阅读。",
            sortOrder: 3,
          },
          {
            type: "image",
            imagePath: "/placeholders/zh-gallery-test-1.svg",
            imageAlt: "示例正文图片：制作项目现场的局部画面",
            imageTone: "warm",
            caption: "正文图片可以穿插在段落之间，用于补充项目现场、人物或空间信息。",
            sortOrder: 4,
          },
          {
            type: "heading",
            heading: "2. 正文段落的写法",
            sortOrder: 5,
          },
          {
            type: "paragraph",
            body:
              "正文段落应该面向读者，而不是写给后台系统。建议每段只说明一个重点，例如项目背景、拍摄内容、交付成果或客户需要注意的信息。不要把太多不同内容塞进同一段。",
            sortOrder: 6,
          },
          {
            type: "heading",
            heading: "3. 图片说明的写法",
            sortOrder: 7,
          },
          {
            type: "paragraph",
            body:
              "替代文字是给图片的文字说明，有助于无障碍阅读和搜索理解；图片说明是显示给读者看的注释，可以补充拍摄地点、项目背景或画面内容。当前阶段请使用已有图片路径，正式上传功能将在后续实现。",
            sortOrder: 8,
          },
          {
            type: "image",
            imagePath: "/placeholders/zh-gallery-test-2.svg",
            imageAlt: "示例正文图片：第二张项目说明图片",
            imageTone: "rust",
            caption: "如果一篇文章需要多张图片，可以按阅读顺序添加多个图片区块。",
            sortOrder: 9,
          },
        ],
      },
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
