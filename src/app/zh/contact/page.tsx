import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { contactPageContent } from "@/data/pages";

export const metadata: Metadata = {
  title: contactPageContent.zh.metaTitle,
  description: contactPageContent.zh.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="zh" page="contact" currentPath="/zh/contact/">
      <ContactPage content={contactPageContent.zh} />
    </SiteLayout>
  );
}
