import Image from "next/image";
import Link from "next/link";

/** Paths derived from the master logo — see scripts/generate-brand-assets.sh */
const STACKED = "/brand/ayurpass-logo-stacked.png";
const MARK = "/brand/ayurpass-mark.png";

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

  if (variant === "stacked" || variant === "mark-only") {
    const size = variant === "stacked" ? 112 : 36;
    return (
      <Link href="/" className={`inline-flex ${className}`} aria-label="AyurPass home">
        <Image
          src={STACKED}
          alt="AyurPass"
          width={size}
          height={size}
          className={`shrink-0 object-contain ${
            variant === "stacked" ? "h-28 w-28" : "h-9 w-9"
          }`}
          priority={variant === "stacked"}
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 group ${className}`}
      aria-label="AyurPass home"
    >
      <Image
        src={MARK}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 object-contain"
        priority
      />
      <span className={wordmarkClass}>AyurPass</span>
    </Link>
  );
}