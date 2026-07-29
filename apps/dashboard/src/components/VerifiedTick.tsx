"use client";

import { useId } from "react";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = {
  sm: 16,
  md: 19,
  lg: 23,
};

/**
 * X-style verified mark: blue rosette with a crisp white check.
 * Reads clearly at name-line sizes and in compact badges.
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
  const clipId = useId().replace(/:/g, "");
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
        filter: "drop-shadow(0 1px 1px rgba(15, 20, 25, 0.18))",
      }}
    >
      <svg viewBox="0 0 24 24" width={px} height={px} aria-hidden className="block">
        <defs>
          <clipPath id={clipId}>
            <path d="M12 1.35 14.12 3.2l2.78-.35 1.15 2.56 2.57 1.14-.36 2.79L22.1 11.45l-1.84 2.12.36 2.78-2.57 1.15-1.15 2.56-2.78-.35L12 21.55l-2.12-1.84-2.78.35-1.15-2.56-2.57-1.15.36-2.78L1.9 11.45l1.84-2.11-.36-2.79 2.57-1.14L7.1 2.85l2.78.35L12 1.35Z" />
          </clipPath>
        </defs>
        <path
          d="M12 1.35 14.12 3.2l2.78-.35 1.15 2.56 2.57 1.14-.36 2.79L22.1 11.45l-1.84 2.12.36 2.78-2.57 1.15-1.15 2.56-2.78-.35L12 21.55l-2.12-1.84-2.78.35-1.15-2.56-2.57-1.15.36-2.78L1.9 11.45l1.84-2.11-.36-2.79 2.57-1.14L7.1 2.85l2.78.35L12 1.35Z"
          fill="#1D9BF0"
        />
        <circle
          cx="12"
          cy="11.45"
          r="10.1"
          fill="rgba(255,255,255,0.12)"
          clipPath={`url(#${clipId})`}
        />
        <path
          d="m7.35 12.15 2.95 3.05 6.35-6.55"
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
