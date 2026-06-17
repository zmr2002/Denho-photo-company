import type { HomeContent } from "@/data/home";
import { BusinessField } from "@/components/ui/BusinessField";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { ProjectCase } from "@/components/ui/ProjectCase";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface HomePageProps {
  content: HomeContent;
  basePath: string;
}

export function HomePage({ content, basePath }: HomePageProps) {
  return (
    <>
      <section className="home-hero">
        <PlaceholderMedia label={content.hero.mediaLabel} size="hero" dark showLabel={false} />
        <div className="home-hero-overlay">
          <div className="wide-container">
            <p>{content.hero.label}</p>
            <h1>{content.hero.title}</h1>
            <div className="hero-footer">
              <p>{content.hero.description}</p>
              <span>SCROLL</span>
            </div>
          </div>
        </div>
      </section>

      <section className="production-band" aria-label="Production capabilities">
        <div className="wide-container">
          <p>ONE-STOP PRODUCTION</p>
          <ol>
            <li>
              <span>01</span> Planning
            </li>
            <li>
              <span>02</span> Shooting
            </li>
            <li>
              <span>03</span> Editing
            </li>
            <li>
              <span>04</span> Delivery
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
            <h2 className="statement-title">{content.about.title}</h2>
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
            <div className="border-t border-stone-400">
              {content.news.items.map((item) => (
                <article className="news-row" key={`${item.date}-${item.title}`}>
                  <div className="news-meta">
                    <time>{item.date}</time>
                    <span>{item.category}</span>
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                  </div>
                  <span className="news-arrow" aria-hidden="true">
                    ↗
                  </span>
                </article>
              ))}
            </div>
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
                key={work.title}
                {...work}
                number={String(index + 1).padStart(2, "0")}
              />
            ))}
          </div>
          <div className="mt-12 flex items-center justify-between gap-6">
            <a className="button-light" href={`${basePath}/works/`}>
              {content.works.linkLabel}
            </a>
            <div className="static-controls" aria-label="Static carousel preview">
              <span>PREV</span>
              <strong>01 / 03</strong>
              <span>NEXT</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-band">
        <div className="wide-container grid gap-10 py-20 md:grid-cols-12 md:items-end md:py-28">
          <div className="md:col-span-3">
            <p className="section-label text-stone-950">{content.contact.label}</p>
          </div>
          <div className="md:col-span-7">
            <h2>{content.contact.title}</h2>
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
