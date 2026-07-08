import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getAboutPageContent } from "@/lib/content";

const content = getAboutPageContent("en");

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="en" page="about" currentPath="/en/about/">
      <AboutPage content={content} basePath="/en" />
    </SiteLayout>
  );
}
