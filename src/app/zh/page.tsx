import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { homeContent } from "@/data/home";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} | 日本摄影与视频制作`,
  description: "位于日本，提供从策划、摄影、视频制作到编辑与交付的一体化影像服务。",
};

export default function Page() {
  return (
    <SiteLayout lang="zh" page="home" currentPath="/zh/">
      <HomePage content={homeContent.zh} basePath="/zh" />
    </SiteLayout>
  );
}
