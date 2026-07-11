CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_group_id UUID NOT NULL,
    locale VARCHAR(5) NOT NULL CHECK (locale IN ('ja', 'zh', 'en')),
    slug VARCHAR(160) NOT NULL,
    title VARCHAR(240) NOT NULL,
    excerpt TEXT NOT NULL,
    category VARCHAR(160) NOT NULL,
    author_name VARCHAR(160) NOT NULL,
    hero_label VARCHAR(240),
    hero_image_path TEXT,
    hero_alt TEXT,
    hero_tone VARCHAR(32) NOT NULL DEFAULT 'neutral',
    hero_caption TEXT,
    closing_note TEXT,
    cta_label VARCHAR(240),
    cta_href TEXT,
    status content_status NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ,
    display_order INTEGER NOT NULL DEFAULT 0,
    related_services JSONB NOT NULL DEFAULT '[]'::jsonb,
    seo_title VARCHAR(240),
    seo_description TEXT,
    youtube_url TEXT,
    demo BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT articles_locale_slug_unique UNIQUE (locale, slug),
    CONSTRAINT articles_translation_locale_unique UNIQUE (translation_group_id, locale)
);

CREATE INDEX articles_public_list_index
    ON articles (locale, status, display_order, published_at DESC);

CREATE TABLE article_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    block_type VARCHAR(32) NOT NULL,
    heading TEXT,
    body TEXT,
    image_path TEXT,
    image_alt TEXT,
    image_tone VARCHAR(32) NOT NULL DEFAULT 'neutral',
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX article_blocks_order_index
    ON article_blocks (article_id, sort_order);

CREATE TABLE works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_group_id UUID NOT NULL,
    locale VARCHAR(5) NOT NULL CHECK (locale IN ('ja', 'zh', 'en')),
    slug VARCHAR(160) NOT NULL,
    title VARCHAR(240) NOT NULL,
    summary TEXT NOT NULL,
    client_name VARCHAR(240) NOT NULL,
    project_date VARCHAR(80) NOT NULL,
    category VARCHAR(160) NOT NULL,
    service_category VARCHAR(80) NOT NULL,
    scope TEXT NOT NULL,
    challenge TEXT NOT NULL,
    approach JSONB NOT NULL DEFAULT '[]'::jsonb,
    outcome TEXT NOT NULL,
    deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
    status content_status NOT NULL DEFAULT 'DRAFT',
    featured_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
    featured_order INTEGER NOT NULL DEFAULT 0,
    media_type VARCHAR(32) NOT NULL DEFAULT 'photo',
    gallery_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    seo_title VARCHAR(240),
    seo_description TEXT,
    youtube_url TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT works_locale_slug_unique UNIQUE (locale, slug),
    CONSTRAINT works_translation_locale_unique UNIQUE (translation_group_id, locale)
);

CREATE INDEX works_public_list_index
    ON works (locale, status, featured_on_homepage, featured_order);

CREATE TABLE work_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    label VARCHAR(240) NOT NULL,
    tone VARCHAR(32) NOT NULL DEFAULT 'neutral',
    alt_ja TEXT,
    alt_zh TEXT,
    alt_en TEXT,
    caption_ja TEXT,
    caption_zh TEXT,
    caption_en TEXT,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX work_images_order_index
    ON work_images (work_id, sort_order);

CREATE UNIQUE INDEX work_images_single_cover_index
    ON work_images (work_id)
    WHERE is_cover = TRUE;

CREATE TABLE opening_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    translation_group_id UUID NOT NULL,
    locale VARCHAR(5) NOT NULL CHECK (locale IN ('ja', 'zh', 'en')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    label VARCHAR(160) NOT NULL,
    title VARCHAR(240) NOT NULL,
    body TEXT NOT NULL,
    dismiss_label VARCHAR(160) NOT NULL,
    link_label VARCHAR(160),
    link_href TEXT,
    storage_key VARCHAR(240) NOT NULL,
    dismissal_mode VARCHAR(16) NOT NULL CHECK (dismissal_mode IN ('session', 'local')),
    status content_status NOT NULL DEFAULT 'DRAFT',
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT opening_notices_locale_unique UNIQUE (locale),
    CONSTRAINT opening_notices_translation_locale_unique UNIQUE (translation_group_id, locale),
    CONSTRAINT opening_notices_schedule_valid CHECK (end_at IS NULL OR start_at IS NULL OR end_at > start_at)
);

CREATE INDEX opening_notices_current_index
    ON opening_notices (locale, status, enabled, start_at, end_at);
