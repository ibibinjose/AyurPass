"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { Order, Product } from "@/lib/types";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Select } from "@/components/ui";

/** A Square-style Virtual Terminal: ring up an in-person product sale for a client. */
export default function VirtualTerminalPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [payMethod, setPayMethod] = useState<"CASH" | "CARD_TERMINAL" | "STRIPE_ONLINE">("CASH");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Order | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .productsByProvider(provider.id)
      .then((p) => setProducts(p.filter((x) => x.category !== undefined)))
      .catch(() => {});
  }, [provider]);

  useEffect(reload, [reload]);

  const total = useMemo(
    () =>
      Object.entries(cart).reduce((sum, [id, qty]) => {
        const p = products.find((x) => x.id === id);
        return sum + Number(p?.price ?? 0) * qty;
      }, 0),
    [cart, products],
  );

  if (!provider) {
    return <EmptyState title="No practice linked" body="The virtual terminal is for provider accounts." />;
  }

  function addToCart(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }
  function removeFromCart(id: string) {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }

  async function charge() {
    if (!provider || Object.keys(cart).length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const client = await api.userByEmail(email.trim());
      if (!client) {
        setError("No AyurPass account found for that email. The client must have an account first.");
        return;
      }

      if (payMethod === "STRIPE_ONLINE") {
        const order = await api.createOrder({
          consumerId: client.id,
          items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
        });
        const paid = await api.payOrder(order.id);
        await api.updateOrder(order.id, { status: "FULFILLED" });
        setDone(paid);
      } else {
        const trxId = `${payMethod}-${Date.now()}`;
        const order = await api.createOrder({
          consumerId: client.id,
          items: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
          paymentMethod: payMethod,
          posTransactionId: trxId,
          status: "FULFILLED",
          paymentStatus: "paid",
        });
        setDone(order);
      }

      setCart({});
      setEmail("");
      reload();
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes("stock")
          ? e.message
          : "The sale couldn't be completed. Check the client email and stock levels.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
        Sales
      </p>
      <h1 className="mt-1 font-display text-3xl text-forest">Virtual terminal</h1>
      <p className="mt-1 text-ink-muted">
        Ring up an in-person product sale — charge a client and record it as a fulfilled, paid order.
      </p>

      {done && (
        <div className="mt-6 rounded-2xl border border-hairline bg-clay/50 px-5 py-4 text-sm text-forest">
          Sale complete — {formatMoney(done.subtotal)} processed and fulfilled. Payment Ref:{" "}
          {(done.paymentIntentId || done.posTransactionId || "").slice(0, 18)}….
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Tap items to add
          </h2>
          {products.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                title="No products to sell"
                body="Add products first — they'll show up here to ring up."
              />
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {products.map((p) => {
                const soldOut = p.inventoryQuantity != null && p.inventoryQuantity <= 0;
                return (
                  <button
                    key={p.id}
                    disabled={soldOut}
                    onClick={() => addToCart(p.id)}
                    className="flex items-center justify-between rounded-2xl border border-hairline bg-surface px-4 py-3 text-left transition-colors hover:border-leaf disabled:opacity-50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-ink-muted">
                        {formatMoney(p.price)}
                        {p.inventoryQuantity != null && ` · ${p.inventoryQuantity} in stock`}
                      </p>
                    </div>
                    <PlusIcon className="h-4 w-4 text-forest" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside
          className={`h-fit rounded-2xl border border-hairline bg-surface p-6 lg:sticky lg:self-start top-[calc(3.5rem+var(--safe-top)+0.5rem)] sm:top-[calc(4rem+var(--safe-top)+0.5rem)]`}
        >
          <h2 className="font-display text-lg text-forest">Current sale</h2>
          {Object.keys(cart).length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No items yet — tap products to add them.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {Object.entries(cart).map(([id, qty]) => {
                const p = products.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <li key={id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-foreground">
                      {qty}× {p.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="tabular-nums text-ink-secondary">
                        {formatMoney(Number(p.price ?? 0) * qty)}
                      </span>
                      <button
                        onClick={() => removeFromCart(id)}
                        className="text-ink-muted hover:text-red-700"
                        title="Remove"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 flex justify-between border-t border-hairline pt-3">
            <span className="text-ink-muted">Total</span>
            <span className="text-lg font-semibold text-foreground">{formatMoney(total)}</span>
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Payment method">
              <Select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
              >
                <option value="CASH">Cash (Pay at counter)</option>
                <option value="CARD_TERMINAL">Card Terminal (In-person)</option>
                <option value="STRIPE_ONLINE">Online Card (Stripe)</option>
              </Select>
            </Field>

            <Field label="Client email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </Field>
          </div>
          <ErrorNote message={error} />
          <Button
            className="mt-4 w-full"
            disabled={busy || Object.keys(cart).length === 0 || !email}
            onClick={charge}
          >
            {busy ? "Processing…" : `Process ${formatMoney(total)}`}
          </Button>
          <p className="mt-2 text-xs text-ink-muted">In-person payment records stock decrement immediately.</p>
        </aside>
      </div>
    </div>
  );
}
