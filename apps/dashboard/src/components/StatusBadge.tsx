/**
 * Shared status pill used by booking, order, payment, and consent badges.
 * Keep visual language consistent across the dashboard.
 */
export function StatusBadge({
  label,
  tone = "neutral",
  className = "",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "muted";
  className?: string;
}) {
  const tones: Record<NonNullable<typeof tone>, string> = {
    neutral: "bg-clay text-ink-secondary",
    success: "bg-forest text-white",
    warning: "bg-gold-soft text-forest",
    danger: "bg-red-50 text-red-700",
    info: "bg-leaf text-white",
    muted: "border border-hairline text-ink-secondary",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
