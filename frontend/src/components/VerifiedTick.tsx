"use client";

import { useId } from "react";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = {
  sm: 16,
  md: 19,
  lg: 23,
};

/**
 * Verified mark — green Nike-style swoosh + centre dot.
 * Reads as trust / “approved” next to names.
 */
export function VerifiedTick({
  size = "md",
  className = "",
  title = "Verified on AyurPass",
}: {
  size?: Size;
  className?: string;
  title?: string;
}) {
  const px = SIZE_PX[size];
  const gradId = useId().replace(/:/g, "");
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{
        width: px,
        height: px,
        verticalAlign: "middle",
        filter: "drop-shadow(0 1px 2px rgba(20, 120, 70, 0.35))",
      }}
    >
      <svg viewBox="0 0 24 24" width={px} height={px} aria-hidden className="block">
        <defs>
          <linearGradient id={gradId} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#3dd68c" />
            <stop offset="45%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#0f7a38" />
          </linearGradient>
        </defs>
        {/* Disc */}
        <circle cx="12" cy="12" r="10.5" fill={`url(#${gradId})`} />
        <circle
          cx="12"
          cy="12"
          r="10.5"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
        />
        {/* Soft centre “dot” under the swoosh */}
        <circle cx="11.2" cy="13.1" r="2.35" fill="rgba(255,255,255,0.22)" />
        <circle cx="11.2" cy="13.1" r="1.15" fill="#fff" fillOpacity="0.95" />
        {/* Nike-like swoosh check */}
        <path
          d="M5.8 12.35c1.55 1.05 3.15 2.55 4.55 4.55 3.35-5.85 6.85-8.85 8.85-10.15"
          fill="none"
          stroke="#fff"
          strokeWidth="2.55"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
