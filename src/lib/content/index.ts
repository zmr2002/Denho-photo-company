import type { HomeContent } from "@/data/home";
import { homeContent } from "@/data/home";
import type {
  AboutPageContent,
  ContactPageContent,
  MediaTone,
  ServicesPageContent,
  WorkCategory,
  WorkMediaType,
  WorksPageContent,
} from "@/data/pages";
import {
  aboutPageContent,
  contactPageContent,
  servicesPageContent,
  worksPageContent,
} from "@/data/pages";
import type { Locale } from "@/lib/content/types";
import {
  mockArticles,
  mockNotices,
  mockServiceDetails,
  mockWorks,
} from "@/lib/content/mock";

export type { Article, Locale, Notice, ServiceDetail, Work } from "@/lib/content/types";

export const contentSource = "mock";

const supportedLocales: Locale[] = ["ja", "zh", "en"];

export function getSupportedLocales() {
  return supportedLocales;
}

export function isSupportedLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function getNotices(locale: Locale) {
  return mockNotices.filter((notice) => notice.language === locale && notice.status === "published");
}

export function getArticles(locale: Locale) {
  return mockArticles.filter((article) => article.language === locale && article.status === "published");
}

export function getArticle(locale: Locale, slug: string) {
  return getArticles(locale).find((article) => article.slug === slug);
}

export function getWorks(locale: Locale) {
  return mockWorks.filter((work) => work.language === locale && work.status === "published");
}

export function getWork(locale: Locale, slug: string) {
  return getWorks(locale).find((work) => work.slug === slug);
}

export function getFeaturedWorks(locale: Locale) {
  return getWorks(locale)
    .filter((work) => work.featuredOnHomepage)
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
}

export function getServiceDetail(locale: Locale, slug: "web-production" | "event-setup") {
  return mockServiceDetails.find((service) => service.language === locale && service.slug === slug);
}

export function getServiceDetails(locale: Locale) {
  return mockServiceDetails.filter((service) => service.language === locale);
}

export function getHomePageContent(locale: Locale): HomeContent {
  const base = getBaseHomeContent(locale);
  const notices = getNotices(locale).slice(0, 3);
  const featuredWorks = getFeaturedWorks(locale).slice(0, 3);

  return {
    ...base,
    news: {
      ...base.news,
      items: notices.map((notice) => ({
        date: notice.publishedAt,
        category: notice.category,
        title: notice.title,
        excerpt: notice.excerpt,
      })),
    },
    works: {
      ...base.works,
      items: featuredWorks.map((work) => ({
        category: work.category,
        title: work.title,
        description: work.summary,
        scope: work.scope,
        mediaLabel: work.featuredImage.label,
        mediaTone: work.featuredImage.tone,
      })),
    },
  };
}

export function getServicesPageContent(locale: Locale): ServicesPageContent {
  if (locale === "en") return englishServicesPageContent;
  return servicesPageContent[locale];
}

export function getWorksPageContent(locale: Locale): WorksPageContent {
  const base = locale === "en" ? englishWorksPageContent : worksPageContent[locale];
  const works = getWorks(locale);
  const categories = base.categories.map((category): WorkCategory => {
    const categoryWorks = works.filter((work) =>
      category.id === "featured" ? work.featuredOnHomepage : work.serviceCategory === category.id,
    );

    if (categoryWorks.length === 0) return category;

    return {
      ...category,
      cases: categoryWorks.map((work) => ({
        title: work.title,
        description: work.summary,
        scope: work.scope,
        mediaLabel: work.featuredImage.label,
        mediaTone: work.featuredImage.tone,
        mediaType: work.mediaType,
      })),
    };
  });

  return { ...base, categories };
}

export function getAboutPageContent(locale: Locale): AboutPageContent {
  if (locale === "en") return englishAboutPageContent;
  return aboutPageContent[locale];
}

export function getContactPageContent(locale: Locale): ContactPageContent {
  if (locale === "en") return englishContactPageContent;
  return contactPageContent[locale];
}

function getBaseHomeContent(locale: Locale): HomeContent {
  if (locale === "en") return englishHomeContent;
  return homeContent[locale];
}

function toneForIndex(index: number): MediaTone {
  const tones: MediaTone[] = ["rust", "warm", "cool", "neutral"];
  return tones[index % tones.length];
}

export function workToProjectCase(work: {
  category: string;
  title: string;
  summary: string;
  scope: string;
  featuredImage: { label: string; tone: MediaTone };
  mediaType: WorkMediaType;
}) {
  return {
    category: work.category,
    title: work.title,
    description: work.summary,
    scope: work.scope,
    mediaLabel: work.featuredImage.label,
    mediaTone: work.featuredImage.tone,
    video: work.mediaType === "video",
  };
}

const englishHomeContent: HomeContent = {
  hero: {
    label: "Photography / Film / Live Delivery",
    title: "Photography and film production in Japan.",
    description:
      "testcontext English homepage content for local mock CMS verification.",
    mediaLabel: "English home hero placeholder",
  },
  about: {
    label: "About",
    title: "Local production support from planning to delivery.",
    description:
      "testcontext English about summary for local verification. This is temporary content.",
    languageNote: "Japanese / Simplified Chinese / English structure",
    linkLabel: "About",
  },
  news: {
    label: "Notice",
    title: "Latest notice",
    items: [],
  },
  services: {
    label: "Services",
    title: "Production services",
    description: "testcontext service overview for local English route verification.",
    linkLabel: "Services",
    items: [
      {
        number: "01",
        label: "Event / Conference",
        title: "Event and conference production",
        description: "testcontext service card.",
        mediaLabel: "Event placeholder",
        mediaTone: "rust",
      },
      {
        number: "02",
        label: "Space / Property / Stay",
        title: "Space and stay media",
        description: "testcontext service card.",
        mediaLabel: "Space placeholder",
        mediaTone: "warm",
      },
      {
        number: "03",
        label: "Interview / Documentary",
        title: "Interview and brand story",
        description: "testcontext service card.",
        mediaLabel: "Interview placeholder",
        mediaTone: "cool",
      },
      {
        number: "04",
        label: "Portrait / Profile",
        title: "Portrait and profile",
        description: "testcontext service card.",
        mediaLabel: "Portrait placeholder",
        mediaTone: "neutral",
      },
    ],
  },
  works: {
    label: "Selected Works",
    title: "Mock featured works",
    description: "testcontext featured works from the mock content adapter.",
    linkLabel: "Works",
    items: [],
  },
  contact: {
    label: "Contact",
    title: "Discuss a local production project.",
    description: "testcontext contact summary for local verification.",
    linkLabel: "Contact",
  },
};

const englishServicesPageContent: ServicesPageContent = {
  metaTitle: "Services",
  metaDescription: "English testcontext services page.",
  hero: {
    eyebrow: "Services",
    title: "Production services for local verification.",
    description: "testcontext services page content.",
  },
  fieldsHeading: {
    label: "Business Fields",
    title: "Core service areas",
    description: "testcontext service area structure.",
  },
  fields: englishHomeContent.services.items.map((item, index) => ({
    categoryId: (["event", "space", "interview", "portrait"] as const)[index],
    number: item.number,
    label: item.label,
    title: item.title,
    description: item.description,
    mediaLabel: item.mediaLabel,
    mediaTone: toneForIndex(index),
    formats: ["Planning", "Shooting", "Editing", "Delivery"],
    reversed: index % 2 === 1,
  })),
  processHeading: {
    label: "Production Process",
    title: "From inquiry to delivery",
    description: "testcontext production process.",
  },
  process: ["Inquiry", "Planning", "Shooting", "Editing", "Delivery"].map((label, index) => ({
    number: String(index + 1).padStart(2, "0"),
    label,
    title: `${label} testcontext`,
    text: "testcontext process text.",
  })),
  cta: {
    label: "Project Inquiry",
    title: "testcontext service inquiry",
    linkLabel: "Contact",
  },
};

const englishWorksPageContent: WorksPageContent = {
  metaTitle: "Works",
  metaDescription: "English testcontext works page.",
  hero: {
    eyebrow: "Works / Case Study",
    title: "Mock CMS works for local verification.",
    description: "testcontext works listing content from the adapter.",
  },
  categories: worksPageContent.ja.categories.map((category) => ({
    ...category,
    title: `${category.label} testcontext`,
    description: "testcontext work category description.",
    impressionLabel: `${category.label} placeholder`,
  })),
  cta: {
    label: "Start a Project",
    title: "testcontext works inquiry",
    linkLabel: "Contact",
  },
};

const englishAboutPageContent: AboutPageContent = {
  metaTitle: "About",
  metaDescription: "English testcontext about page.",
  hero: {
    eyebrow: "About",
    title: "Production support in Japan.",
    description: "testcontext about page content.",
  },
  mediaLabel: "English about placeholder",
  statementLabel: "Company Statement",
  statementTitle: "testcontext company statement",
  statementParagraphs: [
    "testcontext about paragraph one.",
    "testcontext about paragraph two.",
  ],
  attitudeHeading: { label: "Production Attitude", title: "testcontext attitude" },
  attitudes: [1, 2, 3].map((number) => ({
    number: String(number).padStart(2, "0"),
    title: `Attitude ${number}`,
    text: "testcontext attitude text.",
  })),
  typesHeading: {
    label: "Project Types",
    title: "Supported project types",
    description: "testcontext project type list.",
  },
  projectTypes: ["Event / Conference", "Space / Stay", "Interview", "Portrait"],
  languageLabel: "Multilingual Support",
  languageTitle: "Japanese / Simplified Chinese / English",
  languageDescription: "testcontext multilingual support description.",
  companyInfo: [
    { term: "Company", detail: "Mock company info" },
    { term: "Location", detail: "Japan / testcontext" },
    { term: "Business", detail: "Photography, film, live delivery" },
  ],
  sampleRequest: {
    label: "Sample Consultation",
    title: "testcontext sample request",
    description: "testcontext sample request description.",
    linkLabel: "Contact",
  },
};

const englishContactPageContent: ContactPageContent = {
  metaTitle: "Contact",
  metaDescription: "English testcontext contact page.",
  hero: {
    eyebrow: "Contact / Project Inquiry",
    title: "Tell us about the project.",
    description: "testcontext contact page content.",
  },
  guideLabel: "Before Inquiry",
  guideTitle: "Helpful project information",
  guideItems: ["Purpose", "Date", "Location", "Deliverables", "Deadline"],
  googleFormTitle: "External form placeholder",
  googleFormText: "The final form strategy is still open.",
  formHeading: "PROJECT INQUIRY FORM",
  formStatus: "Static layout / No submission",
  form: {
    ariaLabel: "Project inquiry form",
    nameLabel: "Name / Company",
    nameEnglish: "Name / Company",
    namePlaceholder: "Your name or company",
    emailLabel: "Email",
    emailEnglish: "Email",
    projectLabel: "Project Type",
    projectEnglish: "Project Type",
    projectPlaceholder: "Select project type",
    projectOptions: ["Event", "Space", "Interview", "Portrait", "Other"],
    dateLabel: "Shooting Date",
    dateEnglish: "Shooting Date",
    datePlaceholder: "YYYY / MM / DD or undecided",
    locationLabel: "Location",
    locationEnglish: "Location",
    locationPlaceholder: "City, venue, or area",
    messageLabel: "Message",
    messageEnglish: "Message",
    messagePlaceholder: "testcontext project background",
    buttonLabel: "Submit inquiry",
    statusText: "Static form. No data is submitted in this local phase.",
  },
  facts: [
    { label: "Production Area", value: "Japan-based" },
    { label: "Languages", value: "Japanese / Simplified Chinese / English" },
    { label: "Response", value: "testcontext" },
  ],
  sampleRequest: {
    label: "Sample Consultation",
    title: "testcontext contact CTA",
    description: "testcontext contact CTA description.",
    linkLabel: "Contact",
  },
};
