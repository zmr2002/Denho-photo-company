import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/pages/ServiceDetailPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  getServiceDetail,
  getServiceDetails,
  getSupportedLocales,
  isSupportedLocale,
  type Locale,
} from "@/lib/content";

type ServiceSlug = "web-production" | "event-setup";

function isServiceSlug(value: string): value is ServiceSlug {
  return value === "web-production" || value === "event-setup";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}): Promise<Metadata> {
  const { locale, service } = await params;
  if (!isSupportedLocale(locale) || !isServiceSlug(service)) return {};
  const detail = getServiceDetail(locale, service);
  return {
    title: detail?.title ?? "Service",
    description: detail?.description,
  };
}

export function generateStaticParams() {
  return getSupportedLocales().flatMap((locale) =>
    getServiceDetails(locale).map((service) => ({
      locale,
      service: service.slug,
    })),
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}) {
  const { locale: localeParam, service } = await params;
  if (!isSupportedLocale(localeParam) || !isServiceSlug(service)) notFound();

  const locale: Locale = localeParam;
  const detail = getServiceDetail(locale, service);
  if (!detail) notFound();

  return (
    <SiteLayout
      lang={locale}
      page="services"
      currentPath={`/${locale}/services/${detail.slug}/`}
    >
      <ServiceDetailPage content={detail} locale={locale} />
    </SiteLayout>
  );
}
