"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, formatMoney } from "@/lib/api";
import type { Order } from "@/lib/types";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";
import { DashHeader, DashTabs } from "@/components/dashboard/DashboardKit";
import { EmptyState, ErrorNote } from "@/components/ui";

type TabId = "all" | "unpaid" | "active" | "cancelled";

export default function PurchasesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [tab, setTab] = useState<TabId>("all");
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) return;
    api
      .ordersByConsumer(user.id)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [user]);

  useEffect(reload, [reload]);

  const filtered = useMemo(() => {
    const list = [...(orders ?? [])].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
    if (tab === "unpaid") {
      return list.filter((o) => o.paymentStatus === "unpaid" && o.status !== "CANCELLED");
    }
    if (tab === "active") {
      return list.filter((o) => o.status === "PENDING" || o.status === "PAID");
    }
    if (tab === "cancelled") {
      return list.filter((o) => o.status === "CANCELLED" || o.status === "REFUNDED");
    }
    return list;
  }, [orders, tab]);

  const counts = useMemo(() => {
    const list = orders ?? [];
    return {
      all: list.length,
      unpaid: list.filter((o) => o.paymentStatus === "unpaid" && o.status !== "CANCELLED").length,
      active: list.filter((o) => o.status === "PENDING" || o.status === "PAID").length,
      cancelled: list.filter((o) => o.status === "CANCELLED" || o.status === "REFUNDED").length,
    };
  }, [orders]);

  async function pay(o: Order) {
    setActing(o.id);
    setError(null);
    try {
      await api.payOrder(o.id);
      reload();
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : "Payment could not be completed.",
      );
    } finally {
      setActing(null);
    }
  }

  async function cancel(o: Order) {
    if (!window.confirm("Cancel this order?")) return;
    setActing(o.id);
    setError(null);
    try {
      await api.updateOrder(o.id, { status: "CANCELLED" });
      if (o.paymentStatus === "paid") await api.refundOrder(o.id).catch(() => {});
      reload();
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof Error ? e.message : "Could not cancel this order.",
      );
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="My wellness"
        title="My orders"
        description="Products purchased from AyurPass practices — pay open invoices or cancel pending orders."
        action={
          <Link
            href="/shop"
            className="inline-flex min-h-10 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
          >
            Visit the shop
          </Link>
        }
      />

      <DashTabs
        tabs={[
          { id: "all", label: "All", count: counts.all },
          { id: "unpaid", label: "Unpaid", count: counts.unpaid },
          { id: "active", label: "Open", count: counts.active },
          { id: "cancelled", label: "Closed", count: counts.cancelled },
        ]}
        value={tab}
        onChange={(id) => setTab(id as TabId)}
      />

      <ErrorNote message={error} />

      <div>
        {orders === null ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={tab === "all" ? "No orders yet" : "Nothing in this filter"}
            body={
              tab === "all"
                ? "Browse the wellness shop for herbal formulations, oils and goods from verified providers."
                : "Try another filter or visit the shop."
            }
            action={
              tab === "all" ? (
                <Link
                  href="/shop"
                  className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white"
                >
                  Browse shop
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((o) => (
              <li
                key={o.id}
                className="rounded-2xl border border-hairline bg-surface p-5 shadow-[0_1px_0_rgba(36,56,46,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {o.items
                        .map((i) => `${i.quantity}× ${i.product?.name ?? "item"}`)
                        .join(", ")}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {o.provider?.businessName && `${o.provider.businessName} · `}
                      {new Date(o.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}{" "}
                      · {formatMoney(o.subtotal)}
                    </p>
                    {o.notes ? (
                      <p className="mt-2 text-sm text-ink-secondary">{o.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={o.status} />
                    <PaymentBadge status={o.paymentStatus} />
                    {o.paymentStatus === "unpaid" && o.status !== "CANCELLED" && (
                      <button
                        type="button"
                        onClick={() => void pay(o)}
                        disabled={acting === o.id}
                        className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-deep disabled:opacity-50"
                      >
                        {acting === o.id ? "Paying…" : "Pay now"}
                      </button>
                    )}
                    {(o.status === "PENDING" || o.status === "PAID") && (
                      <button
                        type="button"
                        onClick={() => void cancel(o)}
                        disabled={acting === o.id}
                        className="text-sm font-medium text-ink-muted underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50"
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
