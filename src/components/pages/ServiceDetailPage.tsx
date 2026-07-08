import type { Locale, ServiceDetail } from "@/lib/content";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ServiceDetailPageProps {
  content: ServiceDetail;
  locale: Locale;
}

export function ServiceDetailPage({ content, locale }: ServiceDetailPageProps) {
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
                <h3>{section.title}</h3>
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
            description="testcontext service CTA"
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
