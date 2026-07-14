export function BookingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-clay text-ink-secondary",
    CONFIRMED: "bg-forest text-white",
    IN_PROGRESS: "bg-gold-soft text-forest",
    COMPLETED: "bg-clay text-forest",
    CANCELLED: "bg-red-50 text-red-700",
    NO_SHOW: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status] ?? "bg-clay text-ink-secondary"}`}
    >
      {status.replace("_", " ").toLowerCase()}
    </span>
  );
}
