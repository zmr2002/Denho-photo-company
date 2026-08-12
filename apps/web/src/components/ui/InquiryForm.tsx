"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { InquiryFormContent } from "@/data/pages";
import { getCsrfHeaders } from "@/lib/api/browser";

interface InquiryFormProps {
  content: InquiryFormContent;
  locale: "ja" | "zh" | "en";
}

const consentText = {
  ja: "入力した情報を問い合わせ対応のために保存・利用することに同意します。",
  zh: "我同意保存并使用所填写的信息，以便处理本次咨询。",
  en: "I consent to storing and using this information to respond to my inquiry.",
};

const successText = {
  ja: "お問い合わせを受け付けました。内容を確認後、ご連絡します。",
  zh: "咨询已提交。我们会在确认内容后与您联系。",
  en: "Your inquiry has been received. We will respond after reviewing it.",
};

const verificationFailureText = {
  ja: "安全確認を読み込めませんでした。ページを再読み込みし、広告ブロックが有効な場合は一時的に無効にしてください。",
  zh: "安全验证组件加载失败。请刷新页面；如果启用了广告拦截，请暂时关闭后重试。",
  en: "The security check could not load. Refresh the page and temporarily disable content blocking if it is enabled.",
};

const verificationExpiredText = {
  ja: "安全確認の有効期限が切れました。もう一度確認してから送信してください。",
  zh: "安全验证已过期，请重新完成验证后提交。",
  en: "The security check expired. Complete it again before submitting.",
};

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function InquiryForm({ content, locale }: InquiryFormProps) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState(content.statusText);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainer = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileReady || !window.turnstile || !turnstileContainer.current) return;
    turnstileWidgetId.current = window.turnstile.render(turnstileContainer.current, {
      sitekey: turnstileSiteKey,
      callback: (token: string) => {
        setTurnstileToken(token);
        setStatus(content.statusText);
      },
      "expired-callback": () => {
        setTurnstileToken("");
        setStatus(verificationExpiredText[locale]);
      },
      "error-callback": () => {
        setTurnstileToken("");
        setStatus(verificationFailureText[locale]);
      },
    });
    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
      }
      turnstileWidgetId.current = null;
    };
  }, [content.statusText, locale, turnstileReady, turnstileSiteKey]);

  function resetTurnstile() {
    setTurnstileToken("");
    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    try {
      const csrfHeaders = await getCsrfHeaders();
      if (!csrfHeaders) {
        setStatus(locale === "zh" ? "安全验证失败，请刷新页面。" : locale === "ja" ? "安全確認に失敗しました。ページを再読み込みしてください。" : "Security verification failed. Please refresh the page.");
        return;
      }
      const response = await fetch("/api/v1/public/inquiries", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", ...csrfHeaders },
        body: JSON.stringify({
          idempotencyKey,
          nameCompany: data.get("nameCompany"),
          email: data.get("email"),
          projectType: data.get("projectType"),
          requestedDate: data.get("requestedDate"),
          location: data.get("location"),
          message: data.get("message"),
          locale,
          consentVersion: "2026-07",
          consented: data.get("consented") === "on",
          turnstileToken,
          companyWebsite: data.get("companyWebsite") || "",
        }),
      });
      resetTurnstile();
      if (!response.ok) {
        setStatus(locale === "zh" ? "提交失败，请检查填写内容。" : locale === "ja" ? "送信できませんでした。入力内容をご確認ください。" : "Submission failed. Please check your entries.");
        return;
      }
      form.reset();
      setIdempotencyKey(crypto.randomUUID());
      setStatus(successText[locale]);
    } catch {
      setStatus(locale === "zh" ? "网络连接中断，内容尚未提交，请稍后重试。" : locale === "ja" ? "通信できませんでした。内容は送信されていません。しばらくしてから再度お試しください。" : "The connection was interrupted. Your inquiry was not sent; please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inquiry-form" aria-label={content.ariaLabel} onSubmit={submit}>
      {turnstileSiteKey ? (
        <Script
          async
          defer
          onError={() => {
            setTurnstileToken("");
            setStatus(verificationFailureText[locale]);
          }}
          onReady={() => setTurnstileReady(true)}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        />
      ) : null}
      <div className="form-row">
        <label htmlFor="name-company">{content.nameLabel} <span>{content.nameEnglish}</span></label>
        <input id="name-company" name="nameCompany" type="text" placeholder={content.namePlaceholder} maxLength={240} required />
      </div>
      <div className="form-row">
        <label htmlFor="email">{content.emailLabel} <span>{content.emailEnglish}</span></label>
        <input id="email" name="email" type="email" placeholder="name@example.com" maxLength={320} required />
      </div>
      <div className="form-row">
        <label htmlFor="project-type">{content.projectLabel} <span>{content.projectEnglish}</span></label>
        <select id="project-type" name="projectType" defaultValue="" required>
          <option value="">{content.projectPlaceholder}</option>
          {content.projectOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="shooting-date">{content.dateLabel} <span>{content.dateEnglish}</span></label>
          <input id="shooting-date" name="requestedDate" type="text" placeholder={content.datePlaceholder} maxLength={120} />
        </div>
        <div className="form-row">
          <label htmlFor="location">{content.locationLabel} <span>{content.locationEnglish}</span></label>
          <input id="location" name="location" type="text" placeholder={content.locationPlaceholder} maxLength={240} />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="message">{content.messageLabel} <span>{content.messageEnglish}</span></label>
        <textarea id="message" name="message" rows={7} placeholder={content.messagePlaceholder} minLength={20} maxLength={5000} required />
      </div>
      <div className="form-row">
        <label><input name="consented" type="checkbox" required /> {consentText[locale]}</label>
      </div>
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="company-website">Website</label>
        <input autoComplete="off" id="company-website" name="companyWebsite" tabIndex={-1} type="text" />
      </div>
      {turnstileSiteKey ? <div ref={turnstileContainer} /> : null}
      <div className="form-actions">
        <button type="submit" disabled={submitting || Boolean(turnstileSiteKey && !turnstileToken)}>{submitting ? "…" : content.buttonLabel}</button>
        <p aria-live="polite">{status}</p>
      </div>
    </form>
  );
}
