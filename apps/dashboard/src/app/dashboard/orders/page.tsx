"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { StatTile } from "@/components/StatTile";
import { DashHeader } from "@/components/dashboard/DashboardKit";
import { Button, EmptyState } from "@/components/ui";

export default function ProviderOrdersPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .ordersByProvider(provider.id)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return <EmptyState title="No practice linked" body="Orders are available for provider accounts." />;
  }

  async function act(o: Order, fn: () => Promise<unknown>) {
    setActing(o.id);
    try {
      await fn();
      reload();
    } finally {
      setActing(null);
    }
  }

  const all = orders ?? [];
  const revenue = all
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
    .reduce((sum, o) => sum + Number(o.providerPayout ?? 0), 0);
  const toFulfil = all.filter((o) => o.status === "PAID").length;

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="Sales"
        title="Orders"
        description={`Product orders for ${provider.businessName}. Fulfil paid orders and track payouts.`}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Total orders" value={all.length} />
        <StatTile label="Awaiting fulfilment" value={toFulfil} />
        <StatTile label="Net product revenue" value={formatMoney(revenue)} hint="After 12% commission." />
      </div>

      <div className="mt-8">
        {orders === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : all.length === 0 ? (
          <EmptyState
            title="No orders yet"
            body="When clients buy your products from the shop, their orders will appear here to fulfil."
          />
        ) : (
          <ul className="space-y-3">
            {all.map((o) => (
              <li key={o.id} className="rounded-2xl border border-hairline bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {o.items.map((i) => `${i.quantity}× ${i.product?.name ?? "item"}`).join(", ")}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {o.consumer?.user?.fullName ?? o.consumer?.user?.email ?? "Client"} ·{" "}
                      {new Date(o.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })} ·{" "}
                      {formatMoney(o.subtotal)} (payout {formatMoney(o.providerPayout ?? 0)})
                      {o.paymentMethod && ` · Paid via ${o.paymentMethod}`}
                    </p>
                    {o.shippingAddress?.city && (
                      <p className="mt-1 text-xs text-ink-muted">
                        Ship to: {[o.shippingAddress.street, o.shippingAddress.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={o.status} />
                    <PaymentBadge status={o.paymentStatus} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-4">
                  {o.status === "PAID" && (
                    <Button
                      disabled={acting === o.id}
                      onClick={() => act(o, () => api.updateOrder(o.id, { status: "FULFILLED" }))}
                      className="!px-3.5 !py-1.5"
                    >
                      Mark fulfilled
                    </Button>
                  )}
                  {o.paymentStatus === "paid" && o.status !== "REFUNDED" && (
                    <Button
                      variant="ghost"
                      disabled={acting === o.id}
                      onClick={() => act(o, () => api.refundOrder(o.id))}
                      className="!px-3.5 !py-1.5"
                    >
                      Refund
                    </Button>
                  )}
                  {(o.status === "PENDING" || o.status === "PAID") && (
                    <Button
                      variant="danger"
                      disabled={acting === o.id}
                      onClick={() => {
                        if (window.confirm("Cancel this order? Stock will be restored."))
                          act(o, () => api.updateOrder(o.id, { status: "CANCELLED" }));
                      }}
                      className="!px-3.5 !py-1.5"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
