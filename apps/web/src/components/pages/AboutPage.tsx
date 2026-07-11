import type { AboutPageContent } from "@/data/pages";
import { PageHero } from "@/components/ui/PageHero";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { SampleRequestCta } from "@/components/ui/SampleRequestCta";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LineBreakText } from "@/components/ui/LineBreakText";

interface AboutPageProps {
  content: AboutPageContent;
  basePath: string;
}

export function AboutPage({ content, basePath }: AboutPageProps) {
  return (
    <>
      <PageHero {...content.hero} />

      <section className="section-space">
        <div className="wide-container">
          <PlaceholderMedia label={content.mediaLabel} size="panoramic" tone="cool" />
          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="section-label">{content.statementLabel}</p>
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <h2 className="statement-title">
                <LineBreakText text={content.statementTitle} />
              </h2>
              <div className="mt-8 grid gap-6 text-base leading-8 text-stone-600 md:grid-cols-2">
                {content.statementParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wide-container pb-20 md:pb-28">
        <SampleRequestCta
          content={content.sampleRequest}
          href={`${basePath}/contact/#inquiry-form`}
        />
      </section>

      <section className="border-y border-stone-300 bg-stone-100 section-space">
        <div className="wide-container">
          <SectionHeading {...content.attitudeHeading} />
          <div className="attitude-list mt-14">
            {content.attitudes.map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark section-space">
        <div className="wide-container">
          <SectionHeading {...content.typesHeading} light />
          <div className="project-type-list mt-16">
            {content.projectTypes.map((type, index) => (
              <div key={type}>
                <span>0{index + 1}</span>
                <strong>{type}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="wide-container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="section-label">{content.languageLabel}</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
              <LineBreakText text={content.languageTitle} />
            </h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="max-w-2xl text-lg leading-8 text-stone-600">
              {content.languageDescription}
            </p>
            <dl className="company-info mt-12">
              {content.companyInfo.map((item) => (
                <div key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
