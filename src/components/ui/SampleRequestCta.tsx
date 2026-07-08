import type { SampleRequestContent } from "@/data/pages";
import { LineBreakText } from "@/components/ui/LineBreakText";

interface SampleRequestCtaProps {
  content: SampleRequestContent;
  href: string;
}

export function SampleRequestCta({ content, href }: SampleRequestCtaProps) {
  return (
    <aside className="sample-request">
      <div>
        <p>{content.label}</p>
        <h2>
          <LineBreakText text={content.title} />
        </h2>
      </div>
      <div>
        <p>{content.description}</p>
        <a className="button-light" href={href}>
          {content.linkLabel}
        </a>
      </div>
    </aside>
  );
}
