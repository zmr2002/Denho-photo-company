import type { MediaTone } from "@/data/pages";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { LineBreakText } from "@/components/ui/LineBreakText";
import type { DisplayText } from "@/lib/text/display-text";

interface BusinessFieldProps {
  number: string;
  label: string;
  title: DisplayText;
  description: string;
  mediaLabel: string;
  mediaTone?: MediaTone;
  formats?: string[];
  reversed?: boolean;
  compact?: boolean;
  worksHref?: string;
  worksLinkLabel?: string;
}

export function BusinessField({
  number,
  label,
  title,
  description,
  mediaLabel,
  mediaTone = "neutral",
  formats = [],
  reversed = false,
  compact = false,
  worksHref,
  worksLinkLabel,
}: BusinessFieldProps) {
  return (
    <article className={`business-field ${compact ? "business-field-compact" : ""}`}>
      <div
        className={`business-field-grid ${
          reversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="business-field-copy">
          <div className="flex items-center gap-4">
            <span className="field-number">{number}</span>
            <p className="section-label">{label}</p>
          </div>
          <h3>
            <LineBreakText text={title} />
          </h3>
          <p className="field-description">{description}</p>
          {formats.length > 0 ? (
            <ul className="format-list" aria-label="Available formats">
              {formats.map((format) => (
                <li key={format}>{format}</li>
              ))}
            </ul>
          ) : null}
          {worksHref && worksLinkLabel ? (
            <a className="service-works-link" href={worksHref}>
              {worksLinkLabel}
              <span aria-hidden="true">↘</span>
            </a>
          ) : null}
        </div>
        <PlaceholderMedia label={mediaLabel} size="wide" tone={mediaTone} />
      </div>
    </article>
  );
}
