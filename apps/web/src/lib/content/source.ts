import type { ContentSource } from "@/lib/content/types";

export function resolveContentSource(value: string | undefined): ContentSource {
  if (value === undefined || value === "" || value === "api") return "api";
  if (value === "mock") return "mock";
  throw new Error(`Unsupported CONTENT_PROVIDER value: ${value}`);
}
