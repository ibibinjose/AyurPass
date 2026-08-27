import Link from "next/link";
import { BRAND_LOGO } from "@/lib/brand";

type LogoVariant = "horizontal" | "stacked" | "mark-only";

function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`font-display text-[1.32rem] font-semibold leading-none tracking-[-0.045em] sm:text-[1.42rem] ${
        dark ? "text-white" : "text-forest"
      }`}
    >
      <span>Ayur</span>
      <span className={dark ? "text-[#f0c46d]" : "text-[#a67a24]"}>Pass</span>
    </span>
  );
}

/**
 * Canonical AyurPass brand lockup.
 *
 * The supplied botanical A-mark remains a high-resolution transparent asset,
 * while the wordmark stays semantic text for sharp rendering and accessibility
 * across headers, authentication pages, footers, and mobile-density layouts.
 */
export function Logo({
  dark = false,
  variant = "horizontal",
  className = "",
  asLink = true,
}: {
  dark?: boolean;
  variant?: LogoVariant;
  className?: string;
  asLink?: boolean;
}) {
  const isStacked = variant === "stacked";
  const isMarkOnly = variant === "mark-only";
  const markClass = isStacked
    ? "h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
    : "h-9 w-9 shrink-0 object-contain transition-transform duration-200 group-hover:scale-[1.04]";

  const content = (
    <>
      {/* The supplied transparent botanical A-mark is decorative when wordmark text is present. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BRAND_LOGO}
        alt={isMarkOnly ? "AyurPass botanical A-mark" : ""}
        className={markClass}
      />
      {!isMarkOnly ? (
        <span
          className={
            isStacked
              ? "flex flex-col items-center gap-1"
              : "flex items-baseline"
          }
        >
          <Wordmark dark={dark} />
          {isStacked ? (
            <span
              className={`text-center text-[8px] font-bold uppercase tracking-[0.26em] ${
                dark ? "text-white/75" : "text-ink-muted"
              }`}
            >
              Ayurveda · Yoga · Spa · Meditation
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );

  const layoutClass = isStacked
    ? "inline-flex flex-col items-center gap-2"
    : "inline-flex items-center gap-2.5";

  if (!asLink) {
    return <span className={`${layoutClass} ${className}`}>{content}</span>;
  }

  return (
    <Link
      href="/"
      className={`${layoutClass} group ${className}`}
      aria-label="AyurPass home"
    >
      {content}
    </Link>
  );
}
