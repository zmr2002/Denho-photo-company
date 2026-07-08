import type { WorkCategory } from "@/data/pages";
import { LineBreakText } from "@/components/ui/LineBreakText";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { WorkCaseCard } from "@/components/ui/WorkCaseCard";

export function WorkCategorySection({
  id,
  number,
  label,
  title,
  description,
  impressionLabel,
  impressionTone,
  cases,
}: WorkCategory) {
  return (
    <section className="work-category-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="work-impression-strip">
        <PlaceholderMedia
          label={impressionLabel}
          size="panoramic"
          tone={impressionTone}
          showLabel={false}
        />
        <div className="work-impression-overlay">
          <div>
            <p>
              {number} / {label}
            </p>
            <h2 id={`${id}-title`}>
              <LineBreakText text={title} />
            </h2>
          </div>
          <p>{description}</p>
        </div>
      </div>
      <div className="work-case-grid">
        {cases.map((workCase) => (
          <WorkCaseCard key={`${id}-${workCase.title}`} {...workCase} />
        ))}
      </div>
    </section>
  );
}
