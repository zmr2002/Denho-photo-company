"use client";

import { useState } from "react";
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

export function InquiryForm({ content, locale }: InquiryFormProps) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState(content.statusText);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    const csrfHeaders = await getCsrfHeaders();
    if (!csrfHeaders) {
      setSubmitting(false);
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
        turnstileToken: data.get("cf-turnstile-response") || "",
        companyWebsite: data.get("companyWebsite") || "",
      }),
    });
    setSubmitting(false);
    if (!response.ok) {
      setStatus(locale === "zh" ? "提交失败，请检查填写内容。" : locale === "ja" ? "送信できませんでした。入力内容をご確認ください。" : "Submission failed. Please check your entries.");
      return;
    }
    form.reset();
    setIdempotencyKey(crypto.randomUUID());
    setStatus(successText[locale]);
  }

  return (
    <form className="inquiry-form" aria-label={content.ariaLabel} onSubmit={submit}>
      {turnstileSiteKey ? <Script async defer src="https://challenges.cloudflare.com/turnstile/v0/api.js" /> : null}
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
      {turnstileSiteKey ? <div className="cf-turnstile" data-sitekey={turnstileSiteKey} /> : null}
      <div className="form-actions">
        <button type="submit" disabled={submitting}>{submitting ? "…" : content.buttonLabel}</button>
        <p aria-live="polite">{status}</p>
      </div>
    </form>
  );
}
