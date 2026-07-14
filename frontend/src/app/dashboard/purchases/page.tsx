"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { Order } from "@/lib/types";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { EmptyState } from "@/components/ui";

export default function PurchasesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) return;
    api
      .ordersByConsumer(user.id)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [user]);

  useEffect(reload, [reload]);

  async function pay(o: Order) {
    setActing(o.id);
    try {
      await api.payOrder(o.id);
      reload();
    } finally {
      setActing(null);
    }
  }

  async function cancel(o: Order) {
    if (!window.confirm("Cancel this order?")) return;
    setActing(o.id);
    try {
      await api.updateOrder(o.id, { status: "CANCELLED" });
      if (o.paymentStatus === "paid") await api.refundOrder(o.id).catch(() => {});
      reload();
    } finally {
      setActing(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-forest">My orders</h1>
          <p className="mt-1 text-ink-muted">Products you&apos;ve purchased from AyurPass providers.</p>
        </div>
        <Link
          href="/shop"
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-deep"
        >
          Visit the shop
        </Link>
      </div>

      <div className="mt-8">
        {orders === null ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            body="Browse the wellness shop for herbal formulations, oils and goods from verified providers."
          />
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="rounded-2xl border border-hairline bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {o.items.map((i) => `${i.quantity}× ${i.product?.name ?? "item"}`).join(", ")}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {o.provider?.businessName && `${o.provider.businessName} · `}
                      {new Date(o.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })} ·{" "}
                      {formatMoney(o.subtotal)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={o.status} />
                    <PaymentBadge status={o.paymentStatus} />
                    {o.paymentStatus === "unpaid" && o.status !== "CANCELLED" && (
                      <button
                        onClick={() => pay(o)}
                        disabled={acting === o.id}
                        className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-medium text-white hover:bg-forest-deep disabled:opacity-50"
                      >
                        {acting === o.id ? "Paying…" : "Pay now (test)"}
                      </button>
                    )}
                    {(o.status === "PENDING" || o.status === "PAID") && (
                      <button
                        onClick={() => cancel(o)}
                        disabled={acting === o.id}
                        className="text-sm text-ink-muted underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
