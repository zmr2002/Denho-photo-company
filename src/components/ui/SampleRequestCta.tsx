import type { SampleRequestContent } from "@/data/pages";

interface SampleRequestCtaProps {
  content: SampleRequestContent;
  href: string;
}

export function SampleRequestCta({ content, href }: SampleRequestCtaProps) {
  return (
    <aside className="sample-request">
      <div>
        <p>{content.label}</p>
        <h2>{content.title}</h2>
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
