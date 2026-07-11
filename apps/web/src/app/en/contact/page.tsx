import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getContactPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

const content = getContactPageContent("en");

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="en" page="contact" currentPath="/en/contact/">
      <ContactPage content={content} />
    </SiteLayout>
  );
}
