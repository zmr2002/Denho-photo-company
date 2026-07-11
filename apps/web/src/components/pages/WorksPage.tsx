import type { WorksPageContent } from "@/data/pages";
import { LineBreakText } from "@/components/ui/LineBreakText";
import { PageHero } from "@/components/ui/PageHero";
import { WorkCategorySection } from "@/components/ui/WorkCategorySection";

interface WorksPageProps {
  content: WorksPageContent;
  basePath: string;
}

export function WorksPage({ content, basePath }: WorksPageProps) {
  const galleryLabels = basePath === "/zh"
    ? {
        dialog: "图片画廊",
        close: "关闭图片查看器",
        previous: "上一张图片",
        next: "下一张图片",
      }
    : basePath === "/en"
      ? {
          dialog: "image gallery",
          close: "Close image viewer",
          previous: "Previous image",
          next: "Next image",
        }
      : {
          dialog: "画像ギャラリー",
          close: "画像ビューアを閉じる",
          previous: "前の画像",
          next: "次の画像",
        };

  return (
    <>
      <PageHero {...content.hero} />

      <section className="section-space">
        <div className="wide-container">
          <div className="case-index">
            {content.categories.map((category) => (
              <a href={`#${category.id}`} key={category.id}>
                {category.number} {category.label}
              </a>
            ))}
          </div>

          <div className="work-category-list">
            {content.categories.map((category) => (
              <WorkCategorySection key={category.id} {...category} galleryLabels={galleryLabels} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark">
        <div className="wide-container flex flex-col gap-8 py-20 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-label">{content.cta.label}</p>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
              <LineBreakText text={content.cta.title} />
            </h2>
          </div>
          <a className="button-light shrink-0" href={`${basePath}/contact/`}>
            {content.cta.linkLabel}
          </a>
        </div>
      </section>
    </>
  );
}
