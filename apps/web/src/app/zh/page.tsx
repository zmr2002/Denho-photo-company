import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getHomePageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "摄影与影像制作",
  description: "在日本提供从策划、拍摄、编辑到交付的一体化摄影与影像制作服务。",
};

export default async function Page() {
  const content = await getHomePageContent("zh");

  return (
    <SiteLayout lang="zh" page="home" currentPath="/zh/">
      <HomePage content={content} basePath="/zh" />
    </SiteLayout>
  );
}
