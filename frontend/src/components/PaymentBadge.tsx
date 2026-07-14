import type { PaymentStatus } from "@/lib/types";

const STYLES: Record<PaymentStatus, string> = {
  unpaid: "border border-hairline text-ink-secondary",
  paid: "bg-forest text-white",
  refunded: "bg-gold-soft text-forest",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STYLES[status] ?? STYLES.unpaid}`}
    >
      {status}
    </span>
  );
}
