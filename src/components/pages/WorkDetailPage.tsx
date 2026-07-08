import type { Work } from "@/lib/content";
import { LineBreakText } from "@/components/ui/LineBreakText";
import { PageHero } from "@/components/ui/PageHero";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

interface WorkDetailPageProps {
  work: Work;
}

export function WorkDetailPage({ work }: WorkDetailPageProps) {
  return (
    <>
      <PageHero
        eyebrow={`${work.category} / ${work.projectDate}`}
        title={work.title}
        description={work.summary}
      />

      <section className="section-space">
        <div className="wide-container">
          <PlaceholderMedia
            label={work.featuredImage.label}
            size="panoramic"
            tone={work.featuredImage.tone}
            video={work.mediaType === "video"}
          />

          <div className="mt-14 grid gap-12 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <p className="section-label">Project Info</p>
              <dl className="company-info mt-8">
                <div>
                  <dt>Client</dt>
                  <dd>{work.clientName}</dd>
                </div>
                <div>
                  <dt>Scope</dt>
                  <dd>{work.scope}</dd>
                </div>
              </dl>
            </aside>

            <article className="lg:col-span-8 lg:col-start-5">
              <h2 className="statement-title">
                <LineBreakText text="Case study" />
              </h2>
              <div className="mt-8 grid gap-8 text-base leading-8 text-stone-600">
                <section>
                  <p className="section-label">Challenge</p>
                  <p className="mt-3">{work.challenge}</p>
                </section>
                <section>
                  <p className="section-label">Approach</p>
                  <ul className="mt-3 grid gap-3">
                    {work.approach.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <p className="section-label">Outcome</p>
                  <p className="mt-3">{work.outcome}</p>
                </section>
                <section>
                  <p className="section-label">Deliverables</p>
                  <p className="mt-3">{work.deliverables.join(" / ")}</p>
                </section>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
