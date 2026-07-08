"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, TouchEvent } from "react";
import type { DisplayText } from "@/lib/text/display-text";
import { displayTextToString } from "@/lib/text/display-text";
import type { GalleryImage, MediaTone, WorkMediaType } from "@/data/pages";
import { LineBreakText } from "@/components/ui/LineBreakText";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

interface PortfolioGalleryProps {
  variant: "project" | "work";
  number?: string;
  category: string;
  title: DisplayText;
  description: string;
  scope: string;
  mediaLabel: string;
  mediaTone?: MediaTone;
  mediaType?: WorkMediaType;
  video?: boolean;
  galleryImages?: GalleryImage[];
}

export function PortfolioGallery({
  variant,
  number,
  category,
  title,
  description,
  scope,
  mediaLabel,
  mediaTone = "neutral",
  mediaType = "photo",
  video = false,
  galleryImages,
}: PortfolioGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const titleText = displayTextToString(title);

  const images = useMemo<GalleryImage[]>(
    () =>
      galleryImages?.length
        ? galleryImages
        : [
            {
              label: mediaLabel,
              alt: `${titleText} gallery placeholder`,
              tone: mediaTone,
            },
          ],
    [galleryImages, mediaLabel, mediaTone, titleText],
  );

  const activeImage = images[activeIndex];
  const totalLabel = String(images.length).padStart(2, "0");
  const activeLabel = String(activeIndex + 1).padStart(2, "0");

  const openGallery = () => {
    setActiveIndex(0);
    setIsOpen(true);
  };

  const closeGallery = useCallback(() => setIsOpen(false), []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }, [images.length]);

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openGallery();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeGallery, isOpen, showNext, showPrevious]);

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 44) {
      if (deltaX > 0) {
        showPrevious();
      } else {
        showNext();
      }
    }

    setTouchStartX(null);
  };

  return (
    <>
      {variant === "project" ? (
        <article
          className="project-case portfolio-trigger"
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={openGallery}
          onKeyDown={handleTriggerKeyDown}
        >
          <PlaceholderMedia label={mediaLabel} size="panoramic" video={video} tone={mediaTone} />
          <div className="project-case-info">
            <div>
              <p className="section-label">{number ? `${number} / ${category}` : category}</p>
              <h3>
                <LineBreakText text={title} />
              </h3>
            </div>
            <div>
              <p className="project-description">{description}</p>
              <p className="project-scope">{scope}</p>
            </div>
          </div>
        </article>
      ) : (
        <article
          className="work-case-card portfolio-trigger"
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={openGallery}
          onKeyDown={handleTriggerKeyDown}
        >
          <div className={`work-case-media work-case-media-${mediaType}`}>
            <PlaceholderMedia
              label={mediaLabel}
              size="wide"
              tone={mediaTone}
              video={mediaType === "video"}
            />
            <span className="work-media-type">{mediaType.toUpperCase()}</span>
            {images.length > 1 ? (
              <span className="gallery-count">01 / {totalLabel}</span>
            ) : null}
          </div>
          <div className="work-case-copy">
            <p>{scope}</p>
            <h3>{titleText}</h3>
            <div>{description}</div>
          </div>
        </article>
      )}

      {isOpen ? (
        <div
          className="portfolio-gallery-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="portfolio-gallery-title"
        >
          <div className="portfolio-gallery-panel">
            <div className="portfolio-gallery-header">
              <div>
                <p>{category}</p>
                <h2 id="portfolio-gallery-title">
                  <LineBreakText text={title} />
                </h2>
              </div>
              <button type="button" onClick={closeGallery}>
                Close
              </button>
            </div>

            <div
              className="portfolio-gallery-stage"
              onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
              onTouchEnd={handleTouchEnd}
            >
              <PlaceholderMedia
                label={activeImage.label}
                size="panoramic"
                tone={activeImage.tone}
                video={video && activeIndex === 0}
              />
            </div>

            <div className="portfolio-gallery-footer">
              <p>{activeImage.alt}</p>
              <div className="portfolio-gallery-controls">
                <button type="button" onClick={showPrevious}>
                  Prev
                </button>
                <strong aria-live="polite">
                  {activeLabel} / {totalLabel}
                </strong>
                <button type="button" onClick={showNext}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
