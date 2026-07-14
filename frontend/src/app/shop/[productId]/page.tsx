"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Order, Product } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LotusIcon, ShieldIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input } from "@/components/ui";

export default function BuyProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!productId) return;
    api
      .product(productId)
      .then((p) => setProduct(p ?? null))
      .catch(() => setProduct(null));
  }, [productId]);

  if (product === null) {
    return (
      <Shell>
        <EmptyState title="Product not found" body="This product may have been removed." />
        <div className="mt-6 text-center">
          <Link href="/shop" className="font-medium text-forest hover:underline">
            ← Back to the shop
          </Link>
        </div>
      </Shell>
    );
  }

  if (product === undefined) {
    return (
      <Shell>
        <div className="h-72 animate-pulse rounded-2xl bg-clay/70" />
      </Shell>
    );
  }

  const stock = product.inventoryQuantity;
  const maxQty = stock != null ? Math.max(0, stock) : 99;
  const subtotal = Number(product.price ?? 0) * quantity;

  async function placeOrder() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api.createOrder({
        consumerId: user.id,
        items: [{ productId: product!.id, quantity }],
        shippingAddress: street || city ? { street, city } : undefined,
      });
      setOrder(created);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes("stock")
          ? e.message
          : "The order couldn't be placed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (order) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg rounded-3xl border border-hairline bg-surface p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest text-gold-soft">
            <LotusIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-3xl text-forest">Order placed</h1>
          <p className="mt-3 leading-relaxed text-ink-secondary">
            {quantity} × <strong className="text-foreground">{product.name}</strong> from{" "}
            {product.provider?.businessName} — {formatMoney(order.subtotal)} total.
          </p>

          {order.paymentStatus === "paid" ? (
            <p className="mx-auto mt-5 w-fit rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-white">
              Paid {formatMoney(order.subtotal)} ✓
            </p>
          ) : (
            <div className="mt-6 rounded-2xl border border-hairline bg-clay/40 p-4">
              <Button
                className="w-full"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    setOrder(await api.payOrder(order.id));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Processing…" : `Pay ${formatMoney(order.subtotal)} with Stripe (test mode)`}
              </Button>
              <p className="mt-2 text-xs text-ink-muted">Test mode — no real card is charged.</p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button onClick={() => router.push("/dashboard/orders")}>View my orders</Button>
            <Button variant="ghost" onClick={() => router.push("/shop")}>
              Keep shopping
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link href="/shop" className="text-sm text-ink-muted hover:text-forest">
        ← Back to the shop
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h1 className="font-display text-3xl text-forest">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {product.category && `${product.category} · `}
            {product.provider &&
              `${product.provider.businessName} (${PROVIDER_TYPE_LABEL[product.provider.type] ?? product.provider.type})`}
          </p>
          {product.description && (
            <p className="mt-4 max-w-xl leading-relaxed text-ink-secondary">{product.description}</p>
          )}

          <div className="mt-8 max-w-sm space-y-4">
            <Field label="Quantity">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </Button>
                <span className="w-10 text-center text-lg font-semibold tabular-nums">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                >
                  +
                </Button>
                {stock != null && <span className="text-sm text-ink-muted">{stock} in stock</span>}
              </div>
            </Field>
            <Field label="Delivery street" hint="Optional for pickup orders.">
              <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="12 Lotus Lane" />
            </Field>
            <Field label="City">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sydney" />
            </Field>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-hairline bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg text-forest">Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Item</dt>
              <dd className="text-right font-medium text-foreground">{product.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Unit price</dt>
              <dd className="font-medium text-foreground">{formatMoney(product.price)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Quantity</dt>
              <dd className="font-medium text-foreground tabular-nums">{quantity}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-hairline pt-3">
              <dt className="text-ink-muted">Total</dt>
              <dd className="text-lg font-semibold text-foreground">{formatMoney(subtotal)}</dd>
            </div>
          </dl>

          {!loading && !user ? (
            <div className="mt-5">
              <p className="text-sm text-ink-secondary">Sign in to complete your purchase.</p>
              <Link
                href="/login"
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-deep"
              >
                Sign in to buy
              </Link>
            </div>
          ) : user && user.role !== "CONSUMER" ? (
            <p className="mt-5 rounded-xl bg-clay/60 px-3.5 py-2.5 text-sm text-ink-secondary">
              You&apos;re signed in as a provider — purchases are made from a wellness-seeker
              account.
            </p>
          ) : (
            <>
              <ErrorNote message={error} />
              <Button
                className="mt-5 w-full"
                disabled={busy || maxQty === 0}
                onClick={placeOrder}
              >
                {busy ? "Placing order…" : maxQty === 0 ? "Sold out" : "Place order"}
              </Button>
            </>
          )}

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Pay online (test mode) or on delivery. Orders can be cancelled until the provider
            fulfils them.
          </p>
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">{children}</main>
      <Footer />
    </>
  );
}
