import type { InquiryFormContent } from "@/data/pages";

interface InquiryFormProps {
  content: InquiryFormContent;
}

export function InquiryForm({ content }: InquiryFormProps) {
  return (
    <form className="inquiry-form" aria-label={content.ariaLabel}>
      <div className="form-row">
        <label htmlFor="name-company">
          {content.nameLabel} <span>{content.nameEnglish}</span>
        </label>
        <input
          id="name-company"
          name="name-company"
          type="text"
          placeholder={content.namePlaceholder}
        />
      </div>
      <div className="form-row">
        <label htmlFor="email">
          {content.emailLabel} <span>{content.emailEnglish}</span>
        </label>
        <input id="email" name="email" type="email" placeholder="name@example.com" />
      </div>
      <div className="form-row">
        <label htmlFor="project-type">
          {content.projectLabel} <span>{content.projectEnglish}</span>
        </label>
        <select id="project-type" name="project-type" defaultValue="">
          <option value="">{content.projectPlaceholder}</option>
          {content.projectOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="shooting-date">
            {content.dateLabel} <span>{content.dateEnglish}</span>
          </label>
          <input
            id="shooting-date"
            name="shooting-date"
            type="text"
            placeholder={content.datePlaceholder}
          />
        </div>
        <div className="form-row">
          <label htmlFor="location">
            {content.locationLabel} <span>{content.locationEnglish}</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder={content.locationPlaceholder}
          />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="message">
          {content.messageLabel} <span>{content.messageEnglish}</span>
        </label>
        <textarea id="message" name="message" rows={7} placeholder={content.messagePlaceholder} />
      </div>
      <div className="form-actions">
        <button type="button" disabled>
          {content.buttonLabel}
        </button>
        <p>{content.statusText}</p>
      </div>
    </form>
  );
}
