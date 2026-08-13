import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { components } from "@/api-contract/api-schema";
import { administrationLoginPath } from "@/lib/auth/return-path";

const apiBaseUrl = process.env.API_INTERNAL_URL || "http://127.0.0.1:8080";

type SessionContract = components["schemas"]["SessionResponse"];

export type AdminSession = Omit<SessionContract, "authenticated" | "userId" | "email" | "displayName" | "role"> & {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  role: "ADMIN" | "EDITOR" | null;
};

export type AdminArticle = {
  id: string; locale: string; slug: string; title: string; excerpt: string; category: string;
  authorName: string; heroLabel: string | null; heroImagePath: string | null; heroAlt: string | null;
  heroTone: string; heroCaption: string | null; closingNote: string | null; ctaLabel: string | null;
  ctaHref: string | null; status: string; publishedAt: string | null; displayOrder: number;
  relatedServices: string[]; seoTitle: string | null; seoDescription: string | null; youtubeUrl: string | null;
  demo: boolean; version: number; createdAt?: string; updatedAt?: string; blocks: Array<{ type: string; heading: string | null; body: string | null;
    imagePath: string | null; imageAlt: string | null; imageTone: string; caption: string | null; sortOrder: number }>;
};

export type AdminWork = {
  id: string; locale: string; slug: string; title: string; status: string; mediaType: string;
  galleryEnabled: boolean; version: number; images: Array<{ path: string; label: string; tone: string;
    altJa: string | null; altZh: string | null; altEn: string | null; captionJa: string | null;
    captionZh: string | null; captionEn: string | null; isCover: boolean; sortOrder: number }>;
};

export type AdminNotice = {
  id: string; locale: string; enabled: boolean; label: string; title: string; body: string;
  dismissLabel: string; linkLabel: string | null; linkHref: string | null; storageKey: string;
  dismissalMode: string; status: string; startAt: string | null; endAt: string | null; version: number;
};

export type MediaAsset = {
  id: string; originalFilename: string; contentType: string; byteSize: number; width: number; height: number;
  sha256: string; status: "ACTIVE" | "TRASHED"; url: string; thumbnailUrl: string; referenceCount: number;
  trashedAt: string | null; purgeAfter: string | null; createdAt: string;
};

export type Inquiry = {
  id: string;
  nameCompany: string;
  email: string;
  projectType: string;
  requestedDate: string | null;
  location: string | null;
  message: string;
  locale: string;
  status: "NEW" | "IN_PROGRESS" | "CLOSED" | "SPAM" | "ANONYMIZED";
  consentVersion: string;
  consentedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AdministratorUser = {
  id: string;
  email: string;
  displayName: string;
  role: "ADMIN" | "EDITOR";
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  eventType: string;
  resourceType: string;
  resourceId: string | null;
  actorDisplayName: string;
  occurredAt: string;
};

export type AdminRevision = {
  id: string;
  version: number;
  action: string;
  snapshot: AdminArticle;
  actorId: string;
  createdAt: string;
};

export async function getAdminSession(): Promise<AdminSession> {
  try {
    const response = await adminApiFetch("/api/v1/auth/session", false);
    if (!response.ok) return anonymousSession();
    return response.json() as Promise<AdminSession>;
  } catch {
    return anonymousSession();
  }
}

function anonymousSession(): AdminSession {
  return {
    authenticated: false,
    userId: null,
    email: null,
    displayName: null,
    role: null,
  };
}

export async function getAdminCollection<T>(collection: "articles" | "works" | "notices") {
  const response = await adminApiFetch(`/api/v1/admin/${collection}`);
  return normalizeContent(await response.json()) as T[];
}

export async function getAdminContent<T>(collection: "articles" | "works", id: string) {
  const response = await adminApiFetch(`/api/v1/admin/${collection}/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Administration API returned ${response.status}`);
  return normalizeContent(await response.json()) as T;
}

export async function getMediaAssets(status: "ACTIVE" | "TRASHED") {
  const response = await adminApiFetch(`/api/v1/admin/media?status=${status}`);
  return response.json() as Promise<MediaAsset[]>;
}

export async function getInquiries(status: Inquiry["status"]) {
  const response = await adminApiFetch(`/api/v1/admin/inquiries?status=${status}`);
  return response.json() as Promise<Inquiry[]>;
}

export async function getAdministratorUsers() {
  const response = await adminApiFetch("/api/v1/admin/users");
  return response.json() as Promise<AdministratorUser[]>;
}

export async function getAuditEvents() {
  const response = await adminApiFetch("/api/v1/admin/audit-events");
  return response.json() as Promise<AuditEvent[]>;
}

export async function getAdminRevisions(collection: "articles" | "works" | "notices", id: string) {
  const response = await adminApiFetch(`/api/v1/admin/${collection}/${encodeURIComponent(id)}/revisions`);
  return normalizeContent(await response.json()) as AdminRevision[];
}

async function adminApiFetch(path: string, requireSuccess = true) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
  if (requireSuccess && response.status === 401) {
    redirect(administrationLoginPath((await headers()).get("x-admin-return-path")));
  }
  if (requireSuccess && !response.ok) {
    throw new Error(`Administration API returned ${response.status}`);
  }
  return response;
}

function normalizeContent(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeContent);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      const normalizedKey = key === "block_type" ? "type" : key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
      const normalizedValue = normalizedKey === "status" && typeof item === "string" ? item.toLowerCase() : normalizeContent(item);
      return [normalizedKey, normalizedValue];
    }),
  );
}
