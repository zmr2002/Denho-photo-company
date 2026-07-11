import type { ContactPageContent } from "@/data/pages";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { PageHero } from "@/components/ui/PageHero";
import { SampleRequestCta } from "@/components/ui/SampleRequestCta";
import { LineBreakText } from "@/components/ui/LineBreakText";

interface ContactPageProps {
  content: ContactPageContent;
}

export function ContactPage({ content }: ContactPageProps) {
  return (
    <>
      <PageHero {...content.hero} />

      <section className="section-space">
        <div className="wide-container grid gap-16 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <p className="section-label">{content.guideLabel}</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              <LineBreakText text={content.guideTitle} />
            </h2>
            <ol className="inquiry-guide mt-10">
              {content.guideItems.map((item, index) => (
                <li key={item}>
                  <span>0{index + 1}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>

            <div className="google-form-placeholder">
              <p>GOOGLE FORM</p>
              <strong>{content.googleFormTitle}</strong>
              <span>{content.googleFormText}</span>
            </div>
          </aside>

          <div className="lg:col-span-7 lg:col-start-6" id="inquiry-form">
            <div className="form-heading">
              <p>{content.formHeading}</p>
              <span>{content.formStatus}</span>
            </div>
            <InquiryForm content={content.form} />
          </div>
        </div>
      </section>

      <section className="wide-container pb-20 md:pb-28">
        <SampleRequestCta content={content.sampleRequest} href="#inquiry-form" />
      </section>

      <section className="section-dark">
        <div className="wide-container grid gap-8 py-16 md:grid-cols-3">
          {content.facts.map((fact) => (
            <div key={fact.label}>
              <p className="section-label">{fact.label}</p>
              <strong className="mt-3 block text-lg text-white">{fact.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
