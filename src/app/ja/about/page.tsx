import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { aboutPageContent } from "@/data/pages";

export const metadata: Metadata = {
  title: aboutPageContent.ja.metaTitle,
  description: aboutPageContent.ja.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="ja" page="about" currentPath="/ja/about/">
      <AboutPage content={aboutPageContent.ja} basePath="/ja" />
    </SiteLayout>
  );
}
