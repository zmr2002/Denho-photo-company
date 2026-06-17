import type { PageHeroContent } from "@/data/pages";

export function PageHero({ eyebrow, title, description }: PageHeroContent) {
  return (
    <section className="page-hero">
      <div className="wide-container py-20 md:py-32">
        <p className="section-label">{eyebrow}</p>
        <h1 className="mt-7 max-w-5xl text-4xl leading-[1.12] font-semibold tracking-[-0.03em] text-stone-950 md:text-7xl">
          {title}
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
