import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteLayout } from "@/components/site/SiteLayout";
import { WorkDetailPage } from "@/components/pages/WorkDetailPage";
import {
  getSupportedLocales,
  getWork,
  getWorks,
  isSupportedLocale,
  type Locale,
} from "@/lib/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) return {};
  const work = await getWork(locale, slug);
  return {
    title: work?.seoTitle ?? "Work",
    description: work?.seoDescription,
  };
}

export async function generateStaticParams() {
  const params = await Promise.all(
    getSupportedLocales().map(async (locale) =>
      (await getWorks(locale)).map((work) => ({ locale, slug: work.slug })),
    ),
  );
  return params.flat();
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  if (!isSupportedLocale(localeParam)) notFound();

  const locale: Locale = localeParam;
  const work = await getWork(locale, slug);
  if (!work) notFound();

  return (
    <SiteLayout lang={locale} page="works" currentPath={`/${locale}/works/${work.slug}/`}>
      <WorkDetailPage work={work} />
    </SiteLayout>
  );
}
