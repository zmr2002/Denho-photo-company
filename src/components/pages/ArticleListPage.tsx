import Link from "next/link";
import type { Article, Locale } from "@/lib/content";
import { PageHero } from "@/components/ui/PageHero";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

interface ArticleListPageProps {
  articles: Article[];
  locale: Locale;
}

export function ArticleListPage({ articles, locale }: ArticleListPageProps) {
  const basePath = `/${locale}`;

  return (
    <>
      <PageHero
        eyebrow="Articles / Journal"
        title="Articles testcontext"
        description="Mock CMS article listing for local verification."
      />

      <section className="section-space">
        <div className="wide-container">
          <div className="news-layout">
            <PlaceholderMedia label="Article listing placeholder" size="wide" tone="cool" />
            <div className="border-t border-stone-400">
              {articles.map((article) => (
                <article className="news-row" key={article.id}>
                  <div className="news-meta">
                    <time>{article.publishedAt}</time>
                    <span>{article.category}</span>
                  </div>
                  <div>
                    <h3>
                      <Link href={`${basePath}/articles/${article.slug}/`}>
                        {article.title}
                      </Link>
                    </h3>
                    <p>{article.excerpt}</p>
                  </div>
                  <span className="news-arrow" aria-hidden="true">
                    -&gt;
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
