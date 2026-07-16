import Link from "next/link";
import { BRAND_LOGO } from "@/lib/brand";

type LogoVariant = "horizontal" | "stacked" | "mark-only";

export function Logo({
  dark = false,
  variant = "horizontal",
  className = "",
}: {
  dark?: boolean;
  variant?: LogoVariant;
  className?: string;
}) {
  const wordmarkClass = `font-display tracking-tight ${
    dark ? "text-white" : "text-forest"
  } text-xl`;

  const imgClass =
    variant === "stacked"
      ? "h-28 w-28 shrink-0 object-contain"
      : "h-9 w-9 shrink-0 object-contain";

  if (variant === "stacked" || variant === "mark-only") {
    return (
      <Link href="/" className={`inline-flex ${className}`} aria-label="AyurPass home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BRAND_LOGO} alt="AyurPass" className={imgClass} />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 group ${className}`}
      aria-label="AyurPass home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BRAND_LOGO} alt="" className={imgClass} />
      <span className={wordmarkClass}>AyurPass</span>
    </Link>
  );
}