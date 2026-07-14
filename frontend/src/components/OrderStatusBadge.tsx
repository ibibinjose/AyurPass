import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-clay text-ink-secondary",
  PAID: "bg-forest text-white",
  FULFILLED: "bg-leaf text-white",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gold-soft text-forest",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STYLES[status] ?? STYLES.PENDING}`}
    >
      {status.toLowerCase()}
    </span>
  );
}
