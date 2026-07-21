"use client";

import { useState, type ImgHTMLAttributes } from "react";

/**
 * Image component with automatic broken-image fallback.
 * When src fails to load (404, CORS error, etc.), hides the img and shows the fallback.
 */
export function SafeImage({
  src,
  alt = "",
  fallback,
  className = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & {
  /** Rendered when the image fails to load or src is empty. */
  fallback?: React.ReactNode;
}) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
