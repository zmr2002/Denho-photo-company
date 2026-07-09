-- Local custom admin MVP schema.
-- This mirrors prisma/schema.prisma and can be applied by Prisma migrate in a healthy schema-engine environment.

PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Article" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "locale" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "authorName" TEXT NOT NULL DEFAULT 'Editorial Team',
  "heroLabel" TEXT,
  "heroAlt" TEXT,
  "heroTone" TEXT NOT NULL DEFAULT 'neutral',
  "heroCaption" TEXT,
  "closingNote" TEXT,
  "ctaLabel" TEXT,
  "ctaHref" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "publishedAt" DATETIME,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "relatedServices" TEXT NOT NULL DEFAULT '[]',
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "youtubeUrl" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "updatedById" TEXT,
  CONSTRAINT "Article_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ArticleBlock" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "articleId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'paragraph',
  "heading" TEXT,
  "body" TEXT,
  "imagePath" TEXT,
  "imageAlt" TEXT,
  "imageTone" TEXT NOT NULL DEFAULT 'neutral',
  "caption" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ArticleBlock_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "OpeningNotice" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "locale" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "label" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "dismissLabel" TEXT NOT NULL,
  "linkLabel" TEXT,
  "linkHref" TEXT,
  "storageKey" TEXT NOT NULL,
  "dismissalMode" TEXT NOT NULL DEFAULT 'session',
  "status" TEXT NOT NULL DEFAULT 'published',
  "startAt" DATETIME,
  "endAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Work" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "locale" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "projectDate" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "serviceCategory" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "challenge" TEXT NOT NULL,
  "approach" TEXT NOT NULL DEFAULT '[]',
  "outcome" TEXT NOT NULL,
  "deliverables" TEXT NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false,
  "featuredOrder" INTEGER NOT NULL DEFAULT 0,
  "mediaType" TEXT NOT NULL DEFAULT 'photo',
  "galleryEnabled" BOOLEAN NOT NULL DEFAULT false,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "youtubeUrl" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "WorkImage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "workId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "tone" TEXT NOT NULL DEFAULT 'neutral',
  "altJa" TEXT,
  "altZh" TEXT,
  "altEn" TEXT,
  "captionJa" TEXT,
  "captionZh" TEXT,
  "captionEn" TEXT,
  "isCover" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "WorkImage_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Article_locale_slug_key" ON "Article"("locale", "slug");
CREATE INDEX IF NOT EXISTS "Article_locale_status_displayOrder_idx" ON "Article"("locale", "status", "displayOrder");
CREATE INDEX IF NOT EXISTS "ArticleBlock_articleId_sortOrder_idx" ON "ArticleBlock"("articleId", "sortOrder");
CREATE UNIQUE INDEX IF NOT EXISTS "OpeningNotice_locale_key" ON "OpeningNotice"("locale");
CREATE INDEX IF NOT EXISTS "OpeningNotice_locale_status_enabled_idx" ON "OpeningNotice"("locale", "status", "enabled");
CREATE UNIQUE INDEX IF NOT EXISTS "Work_locale_slug_key" ON "Work"("locale", "slug");
CREATE INDEX IF NOT EXISTS "Work_locale_status_featuredOnHomepage_featuredOrder_idx" ON "Work"("locale", "status", "featuredOnHomepage", "featuredOrder");
CREATE INDEX IF NOT EXISTS "WorkImage_workId_sortOrder_idx" ON "WorkImage"("workId", "sortOrder");
