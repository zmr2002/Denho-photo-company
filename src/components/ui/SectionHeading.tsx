import type { DisplayText } from "@/lib/text/display-text";
import { LineBreakText } from "@/components/ui/LineBreakText";

interface SectionHeadingProps {
  label: string;
  title: DisplayText;
  description?: string;
  light?: boolean;
}

export function SectionHeading({
  label,
  title,
  description,
  light = false,
}: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <p className="section-label">{label}</p>
        <h2 className={`section-title ${light ? "text-white" : ""}`}>
          <LineBreakText text={title} />
        </h2>
      </div>
      {description ? (
        <p className={`section-description ${light ? "text-stone-400" : ""}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
