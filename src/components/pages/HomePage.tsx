import type { HomeContent } from "@/data/home";
import { BusinessField } from "@/components/ui/BusinessField";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { ProjectCase } from "@/components/ui/ProjectCase";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LineBreakText } from "@/components/ui/LineBreakText";
import { NewsNoticeViewer } from "@/components/ui/NewsNoticeViewer";
import { displayTextToString } from "@/lib/text/display-text";

interface HomePageProps {
  content: HomeContent;
  basePath: string;
}

export function HomePage({ content, basePath }: HomePageProps) {
  const homeLabels = basePath === "/zh"
    ? {
        production: "一站式制作",
        planning: "策划",
        shooting: "拍摄",
        editing: "编辑",
        delivery: "交付",
        scroll: "滚动",
        previous: "上一项",
        next: "下一项",
      }
    : basePath === "/en"
      ? {
          production: "One-stop production",
          planning: "Planning",
          shooting: "Shooting",
          editing: "Editing",
          delivery: "Delivery",
          scroll: "Scroll",
          previous: "Prev",
          next: "Next",
        }
      : {
          production: "ワンストップ制作",
          planning: "企画",
          shooting: "撮影",
          editing: "編集",
          delivery: "納品",
          scroll: "スクロール",
          previous: "前へ",
          next: "次へ",
        };

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
      <section className="home-hero">
        <PlaceholderMedia label={content.hero.mediaLabel} size="hero" dark showLabel={false} />
        <div className="home-hero-overlay">
          <div className="wide-container">
            <p>{content.hero.label}</p>
            <h1>
              <LineBreakText text={content.hero.title} />
            </h1>
            <div className="hero-footer">
              <p>{content.hero.description}</p>
              <span>{homeLabels.scroll}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="production-band" aria-label="Production capabilities">
        <div className="wide-container">
          <p>{homeLabels.production}</p>
          <ol>
            <li>
              <span>01</span> {homeLabels.planning}
            </li>
            <li>
              <span>02</span> {homeLabels.shooting}
            </li>
            <li>
              <span>03</span> {homeLabels.editing}
            </li>
            <li>
              <span>04</span> {homeLabels.delivery}
            </li>
          </ol>
        </div>
      </section>

      <section className="section-space">
        <div className="wide-container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="section-label">{content.about.label}</p>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <h2 className="statement-title">
              <LineBreakText text={content.about.title} />
            </h2>
            <p className="mt-8 max-w-3xl text-base leading-8 text-stone-600 md:text-lg">
              {content.about.description}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-stone-300 pt-6">
              <p className="text-sm font-medium text-stone-800">{content.about.languageNote}</p>
              <a className="text-link motion-link" href={`${basePath}/about/`}>
                {content.about.linkLabel} →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-300 bg-stone-100">
        <div className="wide-container py-16 md:py-24">
          <SectionHeading label={content.news.label} title={content.news.title} />
          <div className="news-layout mt-12">
            <PlaceholderMedia label="Recent production activity" size="wide" tone="cool" />
            <NewsNoticeViewer items={content.news.items} />
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="wide-container">
          <SectionHeading
            label={content.services.label}
            title={content.services.title}
            description={content.services.description}
          />
          <div className="home-service-grid mt-16">
            {content.services.items.map((service) => (
              <BusinessField key={service.number} {...service} compact />
            ))}
          </div>
          <a className="button-primary mt-12" href={`${basePath}/services/`}>
            {content.services.linkLabel}
          </a>
        </div>
      </section>

      <section className="section-dark section-space">
        <div className="wide-container">
          <SectionHeading
            label={content.works.label}
            title={content.works.title}
            description={content.works.description}
            light
          />
          <div className="mt-16">
            {content.works.items.map((work, index) => (
              <ProjectCase
                key={displayTextToString(work.title)}
                {...work}
                number={String(index + 1).padStart(2, "0")}
                galleryLabels={galleryLabels}
              />
            ))}
          </div>
          <div className="mt-12 flex items-center justify-between gap-6">
            <a className="button-light" href={`${basePath}/works/`}>
              {content.works.linkLabel}
            </a>
          </div>
        </div>
      </section>

      <section className="contact-band">
        <div className="wide-container grid gap-10 py-20 md:grid-cols-12 md:items-end md:py-28">
          <div className="md:col-span-3">
            <p className="section-label text-stone-950">{content.contact.label}</p>
          </div>
          <div className="md:col-span-7">
            <h2>
              <LineBreakText text={content.contact.title} />
            </h2>
            <p>{content.contact.description}</p>
          </div>
          <div className="md:col-span-2 md:text-right">
            <a className="button-dark" href={`${basePath}/contact/`}>
              {content.contact.linkLabel}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
