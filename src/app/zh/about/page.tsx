import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { aboutPageContent } from "@/data/pages";

export const metadata: Metadata = {
  title: aboutPageContent.zh.metaTitle,
  description: aboutPageContent.zh.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="zh" page="about" currentPath="/zh/about/">
      <AboutPage content={aboutPageContent.zh} basePath="/zh" />
    </SiteLayout>
  );
}
