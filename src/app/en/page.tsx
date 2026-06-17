import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} | English Site Coming Soon`,
  description: "English placeholder page for a Japan-based photography and film production company.",
};

export default function Page() {
  return (
    <SiteLayout lang="en" page="placeholder" currentPath="/en/">
      <section className="placeholder-home">
        <PlaceholderMedia
          label="English site cinematic visual"
          size="hero"
          dark
          showLabel={false}
        />
        <div className="placeholder-home-overlay">
          <div className="wide-container">
            <p>ENGLISH WEBSITE / IN PREPARATION</p>
            <h1>Photography and film production in Japan.</h1>
            <div>
              <p>
                Planning, photography, videography, live delivery, editing and final
                delivery. English project pages are currently being prepared.
              </p>
              <a className="button-light" href="/ja/">
                View Japanese website
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
