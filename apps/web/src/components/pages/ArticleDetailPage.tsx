import type { Article } from "@/lib/content";
import { ArticleContent } from "@/components/pages/ArticleContent";
import { PageHero } from "@/components/ui/PageHero";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

interface ArticleDetailPageProps {
  article: Article;
}

export function ArticleDetailPage({ article }: ArticleDetailPageProps) {
  const labels = {
    ja: {
      info: "記事情報",
      author: "作成者",
      updated: "更新日",
      related: "関連サービス",
    },
    zh: {
      info: "文章信息",
      author: "作者",
      updated: "更新日期",
      related: "相关服务",
    },
    en: {
      info: "Article Info",
      author: "Author",
      updated: "Updated",
      related: "Related Services",
    },
  }[article.language];

  return (
    <>
      <PageHero
        eyebrow={`${article.category} / ${article.publishedAt}`}
        title={article.title}
        description={article.excerpt}
      />

      <section className="section-space">
        <div className="wide-container grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <p className="section-label">{labels.info}</p>
            <dl className="company-info mt-8">
              <div>
                <dt>{labels.author}</dt>
                <dd>{article.authorName}</dd>
              </div>
              <div>
                <dt>{labels.updated}</dt>
                <dd>{article.updatedAt}</dd>
              </div>
            </dl>
          </aside>

          <article className="lg:col-span-8 lg:col-start-5">
            <PlaceholderMedia
              label={article.featuredImage.label}
              size="panoramic"
              tone={article.featuredImage.tone}
              src={article.featuredImage.src}
              alt={article.featuredImage.alt}
            />
            <div className="mt-10">
              <ArticleContent blocks={article.contentBlocks} />
            </div>
            <div className="mt-10 border-t border-stone-300 pt-6">
              <p className="section-label">{labels.related}</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                {article.relatedServices.join(" / ")}
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
