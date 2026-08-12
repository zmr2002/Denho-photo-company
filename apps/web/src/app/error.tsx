"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const messages = {
  ja: {
    kicker: "田豊株式会社",
    title: "ページを読み込めませんでした",
    description: "一時的にコンテンツへ接続できません。少し時間をおいて再度お試しください。",
    retry: "もう一度試す",
    home: "トップへ戻る",
  },
  zh: {
    kicker: "田豊株式会社",
    title: "页面暂时无法载入",
    description: "内容服务暂时无法连接，请稍后再试。您填写的信息不会因此自动提交。",
    retry: "重新载入",
    home: "返回首页",
  },
  en: {
    kicker: "Denho Co., Ltd.",
    title: "This page could not be loaded",
    description: "The content service is temporarily unavailable. Please try again shortly.",
    retry: "Try again",
    home: "Return home",
  },
};

export default function PublicError({ unstable_retry }: { unstable_retry: () => void }) {
  const pathname = usePathname();
  const locale = pathname?.match(/^\/(ja|zh|en)(?:\/|$)/)?.[1] as keyof typeof messages | undefined;
  const language = locale ?? "ja";
  const message = messages[language];

  return (
    <main className="public-status-page" lang={language}>
      <section className="public-status-panel" role="alert">
        <p className="section-label">{message.kicker}</p>
        <h1>{message.title}</h1>
        <p>{message.description}</p>
        <div className="public-status-actions">
          <button className="public-status-primary" onClick={() => unstable_retry()} type="button">{message.retry}</button>
          <Link className="public-status-secondary" href={`/${language}/`}>{message.home}</Link>
        </div>
      </section>
    </main>
  );
}
