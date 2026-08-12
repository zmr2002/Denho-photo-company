import Link from "next/link";
import { headers } from "next/headers";

const messages = {
  ja: { title: "ページが見つかりません", description: "URLをご確認いただくか、トップページから目的のページをお探しください。", home: "トップへ戻る" },
  zh: { title: "没有找到这个页面", description: "请检查网址，或从首页重新查找所需内容。", home: "返回首页" },
  en: { title: "Page not found", description: "Check the address or return home to find the content you need.", home: "Return home" },
};

export default async function NotFound() {
  const requestLocale = (await headers()).get("x-site-locale");
  const locale = requestLocale === "zh" || requestLocale === "en" ? requestLocale : "ja";
  const message = messages[locale];

  return (
    <main className="public-status-page" lang={locale}>
      <section className="public-status-panel">
        <p className="section-label">404</p>
        <h1>{message.title}</h1>
        <p>{message.description}</p>
        <div className="public-status-actions">
          <Link className="public-status-primary" href={`/${locale}/`}>{message.home}</Link>
        </div>
      </section>
    </main>
  );
}
