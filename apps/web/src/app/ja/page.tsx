import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getHomePageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "写真・映像制作",
  description: "日本国内で企画、撮影、編集、納品まで一貫して対応する写真・映像制作会社。",
};

export default async function Page() {
  const content = await getHomePageContent("ja");

  return (
    <SiteLayout lang="ja" page="home" currentPath="/ja/">
      <HomePage content={content} basePath="/ja" />
    </SiteLayout>
  );
}
