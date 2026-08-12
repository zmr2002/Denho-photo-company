const SITE_TIME_ZONE = "Asia/Tokyo";

export function formatSiteDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value.slice(0, 10) : "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function siteDateInputToTimestamp(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? `${trimmed}T00:00:00+09:00` : null;
}
