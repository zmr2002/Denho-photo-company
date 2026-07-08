import type { HomeContent } from "@/data/home";
import { homeContent } from "@/data/home";
import type { DisplayText } from "@/lib/text/display-text";
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
  mockSiteNotices,
  mockServiceDetails,
  mockWorks,
} from "@/lib/content/mock";

export type { Article, Locale, Notice, ServiceDetail, SiteNotice, Work } from "@/lib/content/types";

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

export function getSiteOpeningNotice(locale: Locale) {
  const now = new Date();

  return mockSiteNotices.find((notice) => {
    if (notice.language !== locale || notice.status !== "published" || !notice.enabled) return false;
    if (notice.startAt && new Date(notice.startAt) > now) return false;
    if (notice.endAt && new Date(notice.endAt) < now) return false;
    return true;
  });
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
        detailTitle: notice.detailTitle,
        detailBody: notice.detailBody,
        detailLead: notice.detailLead,
        detailSectionTitle: notice.detailSectionTitle,
        detailParagraphs: notice.detailParagraphs,
        detailImage: notice.detailImage,
        detailSections: notice.detailSections,
        detailClosing: notice.detailClosing,
        closeLabel: notice.closeLabel,
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
        mediaType: work.mediaType,
        video: work.mediaType === "video",
        galleryImages: work.galleryImages,
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
        category: work.category,
        title: work.title,
        description: work.summary,
        scope: work.scope,
        mediaLabel: work.featuredImage.label,
        mediaTone: work.featuredImage.tone,
        mediaType: work.mediaType,
        galleryImages: work.galleryImages,
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

function lines(...text: string[]): DisplayText {
  return text;
}

export function workToProjectCase(work: {
  category: string;
  title: string;
  summary: string;
  scope: string;
  featuredImage: { label: string; tone: MediaTone };
  galleryImages?: { label: string; alt: string; tone: MediaTone }[];
  mediaType: WorkMediaType;
}) {
  return {
    category: work.category,
    title: work.title,
    description: work.summary,
    scope: work.scope,
    mediaLabel: work.featuredImage.label,
    mediaTone: work.featuredImage.tone,
    galleryImages: work.galleryImages,
    video: work.mediaType === "video",
  };
}

const englishHomeContent: HomeContent = {
  hero: {
    label: "Photography / Film / Same-day Delivery",
    title: lines("Production support", "from planning to delivery."),
    description:
      "A temporary English homepage sample for photography, film, and on-site media delivery projects in Japan.",
    mediaLabel: "Home hero visual",
  },
  about: {
    label: "About",
    title: lines("We shape project value", "from the real production site."),
    description:
      "This local sample describes an end-to-end production team for planning, shooting, editing, and delivery.",
    languageNote: "Japanese / Simplified Chinese / English support",
    linkLabel: "About",
  },
  news: {
    label: "Notice",
    title: "Latest notice",
    items: [],
  },
  services: {
    label: "Services",
    title: lines("Four production", "service areas"),
    description: "Temporary service overview for event, space, interview, and portrait projects.",
    linkLabel: "Services",
    items: [
      {
        number: "01",
        label: "Event / Conference",
        title: "Event and conference production",
        description: "Capture the schedule, speakers, and atmosphere of business events.",
        mediaLabel: "Event production",
        mediaTone: "rust",
      },
      {
        number: "02",
        label: "Space / Stay",
        title: "Space and stay media",
        description: "Show the design intent, details, and visitor experience of a place.",
        mediaLabel: "Space production",
        mediaTone: "warm",
      },
      {
        number: "03",
        label: "Interview / Brand Story",
        title: "Interview and brand story",
        description: "Turn people, work, and background into credible production content.",
        mediaLabel: "Interview production",
        mediaTone: "cool",
      },
      {
        number: "04",
        label: "Portrait / Profile",
        title: "Portrait and profile",
        description: "Create natural and professional profile visuals for people and teams.",
        mediaLabel: "Portrait production",
        mediaTone: "neutral",
      },
    ],
  },
  works: {
    label: "Selected Works",
    title: lines("Sample featured", "projects"),
    description: "Temporary project examples from the local mock content adapter.",
    linkLabel: "Works",
    items: [],
  },
  contact: {
    label: "Contact",
    title: lines("Discuss a production", "project in Japan."),
    description: "Share the current project background, date, location, and deliverables.",
    linkLabel: "Contact",
  },
};

const englishServicesPageContent: ServicesPageContent = {
  metaTitle: "Services",
  metaDescription: "Temporary English services page for local verification.",
  hero: {
    eyebrow: "Services",
    title: lines("Production services", "organized around project goals."),
    description: "The sample service page keeps photography, film, editing, and delivery in one workflow.",
  },
  fieldsHeading: {
    label: "Service Areas",
    title: lines("Four core", "production areas"),
    description: "Each area can combine photography, video, editing, and delivery support.",
  },
  fields: englishHomeContent.services.items.map((item, index) => ({
    categoryId: (["event", "space", "interview", "portrait"] as const)[index],
    number: item.number,
    label: item.label,
    title: item.title,
    description: item.description,
    mediaLabel: item.mediaLabel,
    mediaTone: item.mediaTone,
    formats: ["Planning", "Shooting", "Editing", "Delivery"],
    reversed: index % 2 === 1,
  })),
  processHeading: {
    label: "Production Process",
    title: lines("From inquiry", "to delivery"),
    description: "A clear temporary workflow for local production verification.",
  },
  process: ["Inquiry", "Planning", "Shooting", "Editing", "Delivery"].map((label, index) => ({
    number: String(index + 1).padStart(2, "0"),
    label,
    title: `${label} step`,
    text: "Temporary process text for local verification.",
  })),
  cta: {
    label: "Project Inquiry",
    title: lines("Discuss the right", "production method."),
    linkLabel: "Contact",
  },
};

const englishWorkCategories: WorkCategory[] = [
  {
    id: "featured",
    number: "00",
    label: "Featured Projects",
    title: "Featured projects",
    description: "Representative temporary projects that combine multiple production areas.",
    impressionLabel: "Featured production overview",
    impressionTone: "rust",
    cases: [],
  },
  {
    id: "event",
    number: "01",
    label: "Event / Conference",
    title: "Event and conference",
    description: "Capture the venue, speakers, and audience interaction as a full-day production story.",
    impressionLabel: "Live event atmosphere",
    impressionTone: "rust",
    cases: [],
  },
  {
    id: "space",
    number: "02",
    label: "Space / Stay",
    title: "Space and stay",
    description: "Show design, materials, light, and use cases through local sample media.",
    impressionLabel: "Space and hospitality mood",
    impressionTone: "warm",
    cases: [],
  },
  {
    id: "interview",
    number: "03",
    label: "Interview / Brand Story",
    title: "Interview and brand story",
    description: "Combine spoken content and work scenes to communicate organizational background.",
    impressionLabel: "Voice and workplace detail",
    impressionTone: "cool",
    cases: [],
  },
  {
    id: "portrait",
    number: "04",
    label: "Portrait / Profile",
    title: "Portrait and profile",
    description: "Build a natural and professional profile expression for people and teams.",
    impressionLabel: "Portrait direction",
    impressionTone: "neutral",
    cases: [
      { title: "Creative Leaders", description: "A unified profile series for multiple team leads.", scope: "Portrait / Retouching", mediaLabel: "Creative leaders", mediaTone: "neutral", mediaType: "gallery" },
      { title: "Executive Profile", description: "Management portraits for corporate and public relations use.", scope: "Direction / Photo", mediaLabel: "Executive profile", mediaTone: "cool", mediaType: "photo" },
      { title: "Artist in Studio", description: "A short video profile combining person and workspace.", scope: "Portrait / Film", mediaLabel: "Artist profile", mediaTone: "warm", mediaType: "video" },
    ],
  },
  {
    id: "video",
    number: "05",
    label: "Video Projects",
    title: "Video projects",
    description: "Short films and documentary-style content using sound, movement, and time.",
    impressionLabel: "Film sequence and movement",
    impressionTone: "rust",
    cases: [
      { title: "A Day at the Workshop", description: "A temporary observational film sample from a workshop.", scope: "Film / Sound / Editing", mediaLabel: "Workshop film", mediaTone: "rust", mediaType: "video" },
      { title: "Hospitality Brand Film", description: "A short sample film showing arrival and stay experience.", scope: "Planning / Film", mediaLabel: "Hospitality film", mediaTone: "warm", mediaType: "video" },
      { title: "Conference Highlight", description: "A public-facing event highlight sample.", scope: "Event / Film / Editing", mediaLabel: "Conference highlight", mediaTone: "cool", mediaType: "video" },
    ],
  },
];

const englishWorksPageContent: WorksPageContent = {
  metaTitle: "Works",
  metaDescription: "Temporary English works page for local verification.",
  hero: {
    eyebrow: "Works / Case Study",
    title: lines("Projects begin", "with goals and context."),
    description: "Temporary work examples from the local content adapter.",
  },
  categories: englishWorkCategories,
  cta: {
    label: "Start a Project",
    title: lines("Need a similar", "production project in Japan?"),
    linkLabel: "Contact",
  },
};

const englishAboutPageContent: AboutPageContent = {
  metaTitle: "About",
  metaDescription: "Temporary English about page.",
  hero: {
    eyebrow: "About",
    title: lines("Production support", "based in Japan."),
    description: "This sample page explains the team's production attitude, project types, and language support.",
  },
  mediaLabel: "Production team",
  statementLabel: "Company Statement",
  statementTitle: lines("Not just recording images,", "but understanding what to communicate."),
  statementParagraphs: [
    "The sample company supports event, space, interview, brand story, and portrait projects.",
    "The workflow covers planning, direction, shooting, editing, and delivery inside Japan.",
  ],
  attitudeHeading: { label: "Production Attitude", title: lines("How the team", "approaches production") },
  attitudes: [
    { number: "01", title: "Understand the goal first", text: "The intended use shapes the shoot priorities and delivery format." },
    { number: "02", title: "Make decisions on site", text: "The plan guides production while the team responds to real conditions." },
    { number: "03", title: "Own the delivery", text: "File specs, timing, editing, and handoff are treated as part of production." },
  ],
  typesHeading: {
    label: "Project Types",
    title: lines("Supported", "project types"),
    description: "Temporary project types for local English verification.",
  },
  projectTypes: ["Event / Conference", "Space / Stay", "Interview / Brand Story", "Portrait / Profile"],
  languageLabel: "Language Support",
  languageTitle: lines("Japanese / Simplified Chinese", "/ English"),
  languageDescription: "Communication can be supported in Japanese, Simplified Chinese, and English.",
  companyInfo: [
    { term: "Company", detail: "Temporary company information" },
    { term: "Location", detail: "Japan / details to be confirmed" },
    { term: "Business", detail: "Photography, film, editing, and delivery" },
  ],
  sampleRequest: {
    label: "Sample Consultation",
    title: lines("Discuss sample", "production references"),
    description: "Share the project type, use case, and desired direction when requesting references.",
    linkLabel: "Contact",
  },
};

const englishContactPageContent: ContactPageContent = {
  metaTitle: "Contact",
  metaDescription: "Temporary English contact page.",
  hero: {
    eyebrow: "Contact / Project Inquiry",
    title: lines("Tell us about", "the project."),
    description: "Share the current background, date, location, and expected deliverables.",
  },
  guideLabel: "Before Inquiry",
  guideTitle: lines("Helpful project", "information"),
  guideItems: ["Purpose", "Date", "Location", "Deliverables", "Deadline"],
  googleFormTitle: "External form placeholder",
  googleFormText: "The final form strategy is still open.",
  formHeading: "Project inquiry form",
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
    messagePlaceholder: "Project background, use case, deliverables, and timing",
    buttonLabel: "Submit inquiry",
    statusText: "Static form. No data is submitted in this local phase.",
  },
  facts: [
    { label: "Production Area", value: "Japan-based" },
    { label: "Languages", value: "Japanese / Simplified Chinese / English" },
    { label: "Response", value: "Temporary display" },
  ],
  sampleRequest: {
    label: "Sample Consultation",
    title: lines("Discuss sample", "production references"),
    description: "Use the form to describe the shoot type and intended use.",
    linkLabel: "Contact",
  },
};
