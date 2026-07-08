import type {
  Article,
  Locale,
  MockImage,
  Notice,
  ServiceDetail,
  Work,
} from "@/lib/content/types";

const locales: Locale[] = ["ja", "zh", "en"];

const localeLabel: Record<Locale, string> = {
  ja: "Japanese",
  zh: "Simplified Chinese",
  en: "English",
};

const galleryFor = (language: Locale, project: string): MockImage[] => [
  {
    label: `${localeLabel[language]} ${project} image 01`,
    alt: `${project} gallery placeholder 01`,
    tone: "rust",
  },
  {
    label: `${localeLabel[language]} ${project} image 02`,
    alt: `${project} gallery placeholder 02`,
    tone: "warm",
  },
  {
    label: `${localeLabel[language]} ${project} image 03`,
    alt: `${project} gallery placeholder 03`,
    tone: "cool",
  },
  {
    label: `${localeLabel[language]} ${project} image 04`,
    alt: `${project} gallery placeholder 04`,
    tone: "neutral",
  },
];

export const mockNotices: Notice[] = locales.map((language) => ({
  id: `${language}-notice-availability`,
  language,
  title: `${localeLabel[language]} notice`,
  excerpt:
    "Temporary announcement notice for local CMS fallback verification.",
  detailTitle: "test",
  detailBody: "testcontext",
  category: "NOTICE",
  publishedAt: "2026-07-01",
  status: "published",
  linkHref: `/${language}/contact/`,
}));

export const mockArticles: Article[] = locales.flatMap((language) => [
  {
    id: `${language}-article-planning`,
    language,
    slug: "production-planning",
    title: `${localeLabel[language]} article: production planning`,
    excerpt:
      "Temporary article excerpt for local CMS fallback verification across listing and detail routes.",
    category: "Planning",
    authorName: "Test Editor",
    publishedAt: "2026-07-02",
    updatedAt: "2026-07-02",
    status: "published",
    featuredImage: {
      label: `${localeLabel[language]} article placeholder`,
      alt: "Temporary article image placeholder",
      tone: "cool",
    },
    body: [
      "Temporary article body paragraph one. This text represents CMS rich text without requiring Sanity credentials.",
      "Temporary article body paragraph two. The page uses the content adapter so the future Sanity source can replace this mock source.",
      "Temporary article body paragraph three. This verifies the local three-language content structure.",
    ],
    relatedServices: ["Event / Conference", "Web Production"],
    seoTitle: `${localeLabel[language]} article`,
    seoDescription: "Temporary mock article used for local verification.",
  },
  {
    id: `${language}-article-media`,
    language,
    slug: "media-delivery",
    title: `${localeLabel[language]} article: media delivery`,
    excerpt:
      "Temporary media delivery article for local list, detail, related service, and image placeholder checks.",
    category: "Media",
    authorName: "Test Editor",
    publishedAt: "2026-07-03",
    updatedAt: "2026-07-03",
    status: "published",
    featuredImage: {
      label: `${localeLabel[language]} media article placeholder`,
      alt: "Temporary media article image placeholder",
      tone: "warm",
    },
    body: [
      "Temporary media article paragraph one. This is not production copy.",
      "Temporary media article paragraph two. It exists to verify content rendering and route generation.",
      "Temporary media article paragraph three. Future Sanity content should preserve this route behavior.",
    ],
    relatedServices: ["Works / Case Studies", "Event Setup"],
    seoTitle: `${localeLabel[language]} media article`,
    seoDescription: "Temporary mock media article used for local verification.",
  },
]);

export const mockWorks: Work[] = locales.flatMap((language) => [
  {
    id: `${language}-work-event`,
    language,
    slug: "event-coverage",
    title: `${localeLabel[language]} work: event coverage`,
    summary:
      "Temporary work summary for event photography and video local fallback verification.",
    clientName: "Mock Client",
    projectDate: "2026",
    category: "EVENT / CONFERENCE",
    serviceCategory: "event",
    scope: "PHOTO / FILM / LIVE DELIVERY",
    challenge:
      "Temporary challenge text for confirming structured case study fields without Sanity credentials.",
    approach: [
      "Temporary approach item one for planning.",
      "Temporary approach item two for shooting.",
      "Temporary approach item three for editing.",
    ],
    outcome:
      "Temporary outcome text for local verification of work detail content.",
    deliverables: ["Photo selection", "Short film", "Live delivery set"],
    status: "published",
    featuredOnHomepage: true,
    featuredOrder: 1,
    featuredImage: {
      label: `${localeLabel[language]} event work placeholder`,
      alt: "Temporary event work image placeholder",
      tone: "rust",
    },
    galleryImages: galleryFor(language, "event work"),
    mediaType: "gallery",
    seoTitle: `${localeLabel[language]} event work`,
    seoDescription: "Temporary mock work used for local verification.",
  },
  {
    id: `${language}-work-space`,
    language,
    slug: "space-media",
    title: `${localeLabel[language]} work: space media`,
    summary:
      "Temporary work summary for space, property, and stay media verification.",
    clientName: "Private Mock Client",
    projectDate: "2026",
    category: "SPACE / STAY",
    serviceCategory: "space",
    scope: "PLANNING / PHOTO / SHORT FILM",
    challenge:
      "Temporary challenge text for verifying local structured work detail pages.",
    approach: [
      "Temporary approach item one for location planning.",
      "Temporary approach item two for image selection.",
      "Temporary approach item three for delivery.",
    ],
    outcome:
      "Temporary outcome text for local production route verification.",
    deliverables: ["Hero photos", "Detail cuts", "Short video"],
    status: "published",
    featuredOnHomepage: true,
    featuredOrder: 2,
    featuredImage: {
      label: `${localeLabel[language]} space work placeholder`,
      alt: "Temporary space work image placeholder",
      tone: "warm",
    },
    galleryImages: galleryFor(language, "space work"),
    mediaType: "photo",
    seoTitle: `${localeLabel[language]} space work`,
    seoDescription: "Temporary mock work used for local verification.",
  },
  {
    id: `${language}-work-interview`,
    language,
    slug: "interview-story",
    title: `${localeLabel[language]} work: interview story`,
    summary:
      "Temporary work summary for interview and brand story verification.",
    clientName: "Mock Brand Team",
    projectDate: "2026",
    category: "INTERVIEW / BRAND STORY",
    serviceCategory: "interview",
    scope: "DIRECTION / INTERVIEW / EDITING",
    challenge:
      "Temporary challenge text for testing related service and structured detail fields.",
    approach: [
      "Temporary approach item one for interview direction.",
      "Temporary approach item two for documentary capture.",
      "Temporary approach item three for final editing.",
    ],
    outcome:
      "Temporary outcome text for local mock CMS case study rendering.",
    deliverables: ["Interview photos", "Edited story film", "Web-ready assets"],
    status: "published",
    featuredOnHomepage: true,
    featuredOrder: 3,
    featuredImage: {
      label: `${localeLabel[language]} interview work placeholder`,
      alt: "Temporary interview work image placeholder",
      tone: "cool",
    },
    galleryImages: galleryFor(language, "interview work"),
    mediaType: "video",
    seoTitle: `${localeLabel[language]} interview work`,
    seoDescription: "Temporary mock work used for local verification.",
  },
]);

export const mockServiceDetails: ServiceDetail[] = locales.flatMap((language) => [
  {
    language,
    slug: "web-production",
    eyebrow: "Web Production",
    title: [`${localeLabel[language]} web production`, "local service"],
    description:
      "Temporary service page for local verification of the approved Web Production route.",
    sections: [
      {
        label: "Scope",
        title: ["Website planning", "and production"],
        text: "Temporary text for a developer-controlled service page. This is not CMS-editable layout content.",
        bullets: ["Site planning", "Page production", "Content handoff"],
      },
      {
        label: "Workflow",
        title: ["Content and media", "coordination"],
        text: "Temporary text for verifying service detail rendering across all three languages.",
        bullets: ["Requirements", "Draft structure", "Launch preparation"],
      },
    ],
    ctaLabel: "Project Inquiry",
    ctaTitle: ["Web production", "inquiry"],
    linkLabel: "Contact",
  },
  {
    language,
    slug: "event-setup",
    eyebrow: "Event Setup",
    title: [`${localeLabel[language]} event setup`, "local service"],
    description:
      "Temporary service page for local verification of the approved Event Setup route.",
    sections: [
      {
        label: "Scope",
        title: ["Event preparation", "support"],
        text: "Temporary text for event setup service structure without changing the design system.",
        bullets: ["Venue coordination", "Media flow", "Production support"],
      },
      {
        label: "Workflow",
        title: ["On-site production", "readiness"],
        text: "Temporary text for confirming route and content behavior before real copy is ready.",
        bullets: ["Setup plan", "On-site checks", "Delivery coordination"],
      },
    ],
    ctaLabel: "Project Inquiry",
    ctaTitle: ["Event setup", "inquiry"],
    linkLabel: "Contact",
  },
]);
