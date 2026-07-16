import type { OrderStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

const TONE: Record<OrderStatus, "neutral" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "neutral",
  PAID: "success",
  FULFILLED: "info",
  CANCELLED: "danger",
  REFUNDED: "warning",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge label={status.toLowerCase()} tone={TONE[status] ?? "neutral"} />;
}
