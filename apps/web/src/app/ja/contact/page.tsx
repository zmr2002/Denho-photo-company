import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";
import { SiteLayout } from "@/components/site/SiteLayout";
import { contactPageContent } from "@/data/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: contactPageContent.ja.metaTitle,
  description: contactPageContent.ja.metaDescription,
};

export default function Page() {
  return (
    <SiteLayout lang="ja" page="contact" currentPath="/ja/contact/">
      <ContactPage content={contactPageContent.ja} locale="ja" />
    </SiteLayout>
  );
}
