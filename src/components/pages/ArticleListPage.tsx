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
  const labels = {
    ja: {
      eyebrow: "記事 / ジャーナル",
      title: "記事一覧",
      description: "ローカルCMS確認用の仮記事一覧です。",
      media: "記事一覧",
    },
    zh: {
      eyebrow: "文章 / 专栏",
      title: "文章列表",
      description: "用于本地CMS验证的临时文章列表。",
      media: "文章列表",
    },
    en: {
      eyebrow: "Articles / Journal",
      title: "Articles",
      description: "Temporary article listing for local CMS verification.",
      media: "Article listing",
    },
  }[locale];

  return (
    <>
      <PageHero
        eyebrow={labels.eyebrow}
        title={labels.title}
        description={labels.description}
      />

      <section className="section-space">
        <div className="wide-container">
          <div className="news-layout">
            <PlaceholderMedia label={labels.media} size="wide" tone="cool" />
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
