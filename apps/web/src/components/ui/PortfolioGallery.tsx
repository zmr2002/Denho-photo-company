"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, TouchEvent } from "react";
import { createPortal } from "react-dom";
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
  galleryLabels?: GalleryControlLabels;
}

export interface GalleryControlLabels {
  dialog: string;
  close: string;
  previous: string;
  next: string;
}

const defaultGalleryLabels: GalleryControlLabels = {
  dialog: "Image gallery",
  close: "Close image viewer",
  previous: "Previous image",
  next: "Next image",
};

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
  galleryLabels = defaultGalleryLabels,
}: PortfolioGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const portalRoot = typeof document === "undefined" ? null : document.body;
  const titleText = displayTextToString(title);
  const isVideo = video || mediaType === "video";
  const canOpenGallery = !isVideo;

  const images = useMemo<GalleryImage[]>(
    () =>
      canOpenGallery && galleryImages?.length
        ? galleryImages
        : [
            {
              label: mediaLabel,
              alt: `${titleText} gallery placeholder`,
              tone: mediaTone,
            },
          ],
    [canOpenGallery, galleryImages, mediaLabel, mediaTone, titleText],
  );

  const activeImage = images[activeIndex];
  const totalLabel = String(images.length).padStart(2, "0");
  const activeLabel = String(activeIndex + 1).padStart(2, "0");
  const hasMultipleImages = images.length > 1;

  const openGallery = () => {
    if (!canOpenGallery) return;
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
    if (!canOpenGallery) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openGallery();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
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
          className={`project-case${canOpenGallery ? " portfolio-trigger" : ""}`}
          role={canOpenGallery ? "button" : undefined}
          tabIndex={canOpenGallery ? 0 : undefined}
          aria-haspopup={canOpenGallery ? "dialog" : undefined}
          aria-expanded={canOpenGallery ? isOpen : undefined}
          onClick={canOpenGallery ? openGallery : undefined}
          onKeyDown={canOpenGallery ? handleTriggerKeyDown : undefined}
        >
          <PlaceholderMedia label={mediaLabel} size="panoramic" video={video} tone={mediaTone} src={images[0]?.src} alt={images[0]?.alt} />
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
          className={`work-case-card${canOpenGallery ? " portfolio-trigger" : ""}`}
          role={canOpenGallery ? "button" : undefined}
          tabIndex={canOpenGallery ? 0 : undefined}
          aria-haspopup={canOpenGallery ? "dialog" : undefined}
          aria-expanded={canOpenGallery ? isOpen : undefined}
          onClick={canOpenGallery ? openGallery : undefined}
          onKeyDown={canOpenGallery ? handleTriggerKeyDown : undefined}
        >
          <div className={`work-case-media work-case-media-${mediaType}`}>
            <PlaceholderMedia
              label={mediaLabel}
              size="wide"
              tone={mediaTone}
              video={isVideo}
              src={images[0]?.src}
              alt={images[0]?.alt}
            />
            <span className="work-media-type">{mediaType.toUpperCase()}</span>
            {canOpenGallery && images.length > 1 ? (
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

      {isOpen && portalRoot
        ? createPortal(
        <div
          className="portfolio-gallery-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${titleText} ${galleryLabels.dialog}`}
          onClick={closeGallery}
        >
          <button
            className="portfolio-gallery-close"
            type="button"
            aria-label={galleryLabels.close}
            onClick={closeGallery}
          >
            ×
          </button>
          {hasMultipleImages ? (
            <button
              className="portfolio-gallery-side portfolio-gallery-prev"
              type="button"
              aria-label={galleryLabels.previous}
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
            >
              ‹
            </button>
          ) : null}
          <div className="portfolio-gallery-frame" onClick={(event) => event.stopPropagation()}>
            <div
              className="portfolio-gallery-stage"
              onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
              onTouchEnd={handleTouchEnd}
            >
              <PlaceholderMedia
                label={activeImage.label}
                size="panoramic"
                tone={activeImage.tone}
                src={activeImage.src}
                alt={activeImage.alt}
              />
            </div>
            <p className="portfolio-gallery-counter" aria-live="polite">
              {activeLabel} / {totalLabel}
            </p>
          </div>
          {hasMultipleImages ? (
            <button
              className="portfolio-gallery-side portfolio-gallery-next"
              type="button"
              aria-label={galleryLabels.next}
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
            >
              ›
            </button>
          ) : null}
        </div>,
          portalRoot,
        )
        : null}
    </>
  );
}
