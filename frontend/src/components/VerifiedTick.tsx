import { CheckIcon } from "./icons";

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, { wrap: string; icon: string }> = {
  sm: { wrap: "h-[18px] w-[18px]", icon: "h-[11px] w-[11px]" },
  md: { wrap: "h-[22px] w-[22px]", icon: "h-[13px] w-[13px]" },
  lg: { wrap: "h-[26px] w-[26px]", icon: "h-[15px] w-[15px]" },
};

/**
 * Platform verified mark — Apple-style blue tick, sits next to the name.
 * No "Verified" label text.
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
  const s = SIZE[size];
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--system-blue)] text-white shadow-[0_0.5px_1px_rgba(0,0,0,0.12)] ${s.wrap} ${className}`}
    >
      <CheckIcon className={s.icon} strokeWidth={3} />
    </span>
  );
}
