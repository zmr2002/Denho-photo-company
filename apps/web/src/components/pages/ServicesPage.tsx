import type { ServicesPageContent } from "@/data/pages";
import { BusinessField } from "@/components/ui/BusinessField";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LineBreakText } from "@/components/ui/LineBreakText";

interface ServicesPageProps {
  content: ServicesPageContent;
  basePath: string;
}

export function ServicesPage({ content, basePath }: ServicesPageProps) {
  const worksLinkLabel =
    basePath === "/ja" ? "関連する制作実績を見る" : "查看相关制作案例";

  return (
    <>
      <PageHero {...content.hero} />

      <section className="section-space">
        <div className="wide-container">
          <SectionHeading {...content.fieldsHeading} />
          <div className="mt-16">
            {content.fields.map((field) => (
              <BusinessField
                key={field.categoryId}
                {...field}
                worksHref={`${basePath}/works/#${field.categoryId}`}
                worksLinkLabel={worksLinkLabel}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark section-space">
        <div className="wide-container">
          <SectionHeading {...content.processHeading} light />
          <ol className="process-grid mt-16">
            {content.process.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <p>{step.label}</p>
                <h3>{step.title}</h3>
                <div>{step.text}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="contact-band">
        <div className="wide-container flex flex-col gap-8 py-20 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-label">{content.cta.label}</p>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
              <LineBreakText text={content.cta.title} />
            </h2>
          </div>
          <a className="button-dark shrink-0" href={`${basePath}/contact/`}>
            {content.cta.linkLabel}
          </a>
        </div>
      </section>
    </>
  );
}
