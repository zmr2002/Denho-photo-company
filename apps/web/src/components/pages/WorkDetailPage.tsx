import type { Work } from "@/lib/content";
import { LineBreakText } from "@/components/ui/LineBreakText";
import { PageHero } from "@/components/ui/PageHero";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

interface WorkDetailPageProps {
  work: Work;
}

export function WorkDetailPage({ work }: WorkDetailPageProps) {
  const labels = {
    ja: {
      info: "プロジェクト情報",
      client: "クライアント",
      scope: "制作範囲",
      heading: "事例概要",
      challenge: "課題",
      approach: "進行",
      outcome: "成果",
      deliverables: "納品物",
    },
    zh: {
      info: "项目信息",
      client: "客户",
      scope: "制作范围",
      heading: "案例概要",
      challenge: "课题",
      approach: "执行方式",
      outcome: "成果",
      deliverables: "交付内容",
    },
    en: {
      info: "Project Info",
      client: "Client",
      scope: "Scope",
      heading: "Case study",
      challenge: "Challenge",
      approach: "Approach",
      outcome: "Outcome",
      deliverables: "Deliverables",
    },
  }[work.language];

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
            src={work.featuredImage.src}
            alt={work.featuredImage.alt}
          />

          <div className="mt-14 grid gap-12 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <p className="section-label">{labels.info}</p>
              <dl className="company-info mt-8">
                <div>
                  <dt>{labels.client}</dt>
                  <dd>{work.clientName}</dd>
                </div>
                <div>
                  <dt>{labels.scope}</dt>
                  <dd>{work.scope}</dd>
                </div>
              </dl>
            </aside>

            <article className="lg:col-span-8 lg:col-start-5">
              <h2 className="statement-title">
                <LineBreakText text={labels.heading} />
              </h2>
              <div className="mt-8 grid gap-8 text-base leading-8 text-stone-600">
                <section>
                  <p className="section-label">{labels.challenge}</p>
                  <p className="mt-3">{work.challenge}</p>
                </section>
                <section>
                  <p className="section-label">{labels.approach}</p>
                  <ul className="mt-3 grid gap-3">
                    {work.approach.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <p className="section-label">{labels.outcome}</p>
                  <p className="mt-3">{work.outcome}</p>
                </section>
                <section>
                  <p className="section-label">{labels.deliverables}</p>
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
