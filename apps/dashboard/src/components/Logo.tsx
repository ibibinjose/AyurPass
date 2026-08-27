import Link from "next/link";
import { BRAND_LOGO } from "@/lib/brand";

type LogoVariant = "horizontal" | "stacked" | "mark-only";

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
  const wordmarkClass = `font-display tracking-[-0.035em] ${
    dark ? "text-white" : "text-forest"
  } text-xl font-semibold`;

  const imgClass =
    variant === "stacked"
      ? "h-28 w-28 shrink-0 rounded-[1.4rem] object-contain"
      : "h-9 w-9 shrink-0 rounded-xl object-contain shadow-[0_6px_14px_-10px_rgba(11,46,35,0.72)] transition-transform duration-200 group-hover:scale-[1.04]";

  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BRAND_LOGO}
        alt={variant === "mark-only" ? "AyurPass" : ""}
        className={imgClass}
      />
      {variant === "horizontal" && <span className={wordmarkClass}>AyurPass</span>}
    </>
  );

  if (!asLink) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 group ${className}`}
      aria-label="AyurPass home"
    >
      {content}
    </Link>
  );
}