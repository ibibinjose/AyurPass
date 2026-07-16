import type { PaymentStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

const TONE: Record<PaymentStatus, "muted" | "success" | "warning"> = {
  unpaid: "muted",
  paid: "success",
  refunded: "warning",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <StatusBadge label={status} tone={TONE[status] ?? "muted"} />;
}
