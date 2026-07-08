import type { Locale, ServiceDetail } from "@/lib/content";
import { LineBreakText } from "@/components/ui/LineBreakText";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ServiceDetailPageProps {
  content: ServiceDetail;
  locale: Locale;
}

export function ServiceDetailPage({ content, locale }: ServiceDetailPageProps) {
  const ctaDescription = {
    ja: "制作範囲や進行方法について、現在分かる情報からご相談ください。",
    zh: "请根据目前已确定的信息，咨询制作范围与执行方式。",
    en: "Share the current details so the team can discuss scope and workflow.",
  }[locale];

  return (
    <>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      />

      <section className="section-space">
        <div className="wide-container">
          <div className="attitude-list">
            {content.sections.map((section, index) => (
              <article key={section.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>
                  <LineBreakText text={section.title} />
                </h3>
                <p>{section.text}</p>
                <ul className="mt-6 grid gap-2 text-sm leading-7 text-stone-600">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark section-space">
        <div className="wide-container">
          <SectionHeading
            label={content.ctaLabel}
            title={content.ctaTitle}
            description={ctaDescription}
            light
          />
          <a className="button-light mt-12" href={`/${locale}/contact/`}>
            {content.linkLabel}
          </a>
        </div>
      </section>
    </>
  );
}
