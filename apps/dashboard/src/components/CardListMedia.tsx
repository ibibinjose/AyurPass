"use client";

import { useState } from "react";

/** Internal image with onError fallback. */
function CardListMediaImage({
  src,
  alt,
  fallback,
}: {
  src?: string | null;
  alt: string;
  fallback?: React.ReactNode;
}) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div className="absolute inset-0 flex items-end bg-[linear-gradient(135deg,var(--color-forest),var(--color-leaf))] p-3">
        {fallback}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

/** Shared list-row media pane — large side image for directory list density. */
export function CardListMedia({
  src,
  alt = "",
  fallback,
  badge,
  topRight,
  footer,
  className = "",
}: {
  src?: string | null;
  alt?: string;
  /** Shown when no image (gradient / icon). */
  fallback?: React.ReactNode;
  /** Top-left chips (e.g. category tag). */
  badge?: React.ReactNode;
  /** Top-right chip (e.g. price), opposite the badge. */
  topRight?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`card-list-media relative isolate shrink-0 overflow-hidden bg-clay ${className}`}
    >
      <CardListMediaImage src={src} alt={alt} fallback={fallback} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5"
      />
      {badge ? <div className="absolute left-2 top-2 z-[1] flex flex-wrap gap-1">{badge}</div> : null}
      {topRight ? (
        <div className="absolute right-2 top-2 z-[1] flex flex-wrap justify-end gap-1">{topRight}</div>
      ) : null}
      {footer ? (
        <div className="absolute bottom-2 left-2 right-2 z-[1] flex items-end justify-between gap-1">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
