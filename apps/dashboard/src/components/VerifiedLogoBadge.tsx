import { BRAND_VERIFIED_MARK } from "@/lib/brand";

type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-7 w-7 sm:h-8 sm:w-8",
  md: "h-9 w-9 sm:h-10 sm:w-10",
  lg: "h-11 w-11 sm:h-12 sm:w-12",
};

/**
 * True transparent AyurPass logo mark for verified listings on covers.
 * No plate / chip behind it — only the blue mark floats on the image.
 */
export function VerifiedLogoBadge({
  size = "md",
  className = "",
  title = "Verified on AyurPass",
}: {
  size?: Size;
  className?: string;
  title?: string;
}) {
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={`inline-flex shrink-0 items-center justify-center bg-transparent ${SIZE_CLASS[size]} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BRAND_VERIFIED_MARK}
        alt=""
        className="h-full w-full bg-transparent object-contain"
        style={{
          // Soft legibility on light or busy covers without an opaque plate
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
        }}
        draggable={false}
      />
    </span>
  );
}
