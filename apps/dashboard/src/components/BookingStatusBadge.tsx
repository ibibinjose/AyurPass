import { StatusBadge } from "./StatusBadge";

const TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "neutral",
  CONFIRMED: "success",
  IN_PROGRESS: "warning",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  NO_SHOW: "danger",
};

export function BookingStatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ").toLowerCase();
  return <StatusBadge label={label} tone={TONE[status] ?? "neutral"} />;
}
