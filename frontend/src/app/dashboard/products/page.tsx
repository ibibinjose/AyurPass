"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { MediaGalleryField } from "@/components/MediaField";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Textarea, Select } from "@/components/ui";

interface FormState {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: string;
  inventoryQuantity: string;
  images: string[];
}

const BLANK: FormState = {
  name: "",
  category: "",
  description: "",
  price: "",
  inventoryQuantity: "",
  images: [],
};

export default function ProviderProductsPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [stockModal, setStockModal] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustType, setAdjustType] = useState<"ADJUSTMENT" | "RESTOCK">("ADJUSTMENT");
  const [adjustReason, setAdjustReason] = useState("");
  const [trxLogs, setTrxLogs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .productsByProvider(provider.id)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return <EmptyState title="No practice linked" body="Products are managed by provider accounts." />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !provider) return;
    setBusy(true);
    setError(null);
    const payload = {
      name: form.name,
      category: form.category || undefined,
      description: form.description || undefined,
      price: Number(form.price),
      inventoryQuantity: form.inventoryQuantity ? Number(form.inventoryQuantity) : undefined,
      images: form.images.length ? form.images : undefined,
    };
    try {
      if (form.id) {
        await api.updateProduct(form.id, payload);
      } else {
        await api.createProduct({ ...payload, providerId: provider.id });
      }
      setForm(null);
      reload();
    } catch {
      setError("The product couldn't be saved. Please check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Product) {
    if (!window.confirm(`Delete “${p.name}”?`)) return;
    try {
      await api.deleteProduct(p.id);
      reload();
    } catch {
      setError("This product has orders attached and can't be deleted.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
            Catalogue
          </p>
          <h1 className="mt-1 font-display text-3xl text-forest">Products</h1>
          <p className="mt-1 text-ink-muted">
            Physical goods you sell — herbal formulations, oils, teas and wellness items.
          </p>
        </div>
        {!form && (
          <Button onClick={() => setForm(BLANK)}>
            <PlusIcon className="h-4 w-4" />
            New product
          </Button>
        )}
      </div>

      {form && (
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-hairline bg-surface p-6">
          <h2 className="font-display text-xl text-forest">{form.id ? "Edit product" : "New product"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Triphala Churna 200g" />
            </Field>
            <Field label="Category" hint="Optional">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Herbal supplement" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What it is, its benefits, how to use it." />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (USD)">
              <Input required type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="24" />
            </Field>
            <Field label="Inventory quantity" hint="Leave blank for unlimited / made to order.">
              <Input type="number" min="0" value={form.inventoryQuantity} onChange={(e) => setForm({ ...form, inventoryQuantity: e.target.value })} placeholder="50" />
            </Field>
          </div>
          <MediaGalleryField
            label="Product photos"
            values={form.images}
            onChange={(images) => setForm({ ...form, images })}
            hint="Upload or paste URLs. First image is the shop cover."
            max={8}
          />
          <ErrorNote message={error} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : form.id ? "Save changes" : "Publish product"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {products === null ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : products.length === 0 && !form ? (
          <EmptyState
            title="No products yet"
            body="Publish your first product — it will appear instantly in the public wellness shop for clients to buy."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {products?.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                actions={
                  <div className="flex gap-2">
                    <button
                      title="Edit"
                      onClick={() =>
                        setForm({
                          id: p.id,
                          name: p.name,
                          category: p.category ?? "",
                          description: p.description ?? "",
                          price: String(Number(p.price ?? 0)),
                          inventoryQuantity:
                            p.inventoryQuantity != null ? String(p.inventoryQuantity) : "",
                          images: p.images?.filter(Boolean) ?? [],
                        })
                      }
                      className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-leaf hover:text-forest"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      title="Adjust Stock"
                      onClick={async () => {
                        setStockModal(p);
                        setAdjustQty("");
                        setAdjustReason("");
                        setAdjustType("RESTOCK");
                        setError(null);
                        try {
                          const logs = await api.getInventoryTransactions(p.id);
                          setTrxLogs(logs);
                        } catch {
                          setTrxLogs([]);
                        }
                      }}
                      className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-leaf hover:text-forest"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0.621 0 1.125.504 1.125 1.125z"
                        />
                      </svg>
                    </button>
                    <button
                      title="Delete"
                      onClick={() => remove(p)}
                      className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-red-300 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>

      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-lg rounded-3xl border border-hairline bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="font-display text-2xl text-forest font-semibold">Stock take</h2>
            <p className="text-sm text-ink-secondary mt-1 font-semibold">{stockModal.name}</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError(null);
                try {
                  await api.adjustInventory(stockModal.id, {
                    quantity: Number(adjustQty),
                    type: adjustType,
                    reason: adjustReason || undefined,
                  });
                  setStockModal(null);
                  reload();
                } catch {
                  setError("Could not complete stock adjustment.");
                } finally {
                  setBusy(false);
                }
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Adjustment Quantity" hint="Negative subtracts (e.g. -5).">
                  <Input
                    required
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="e.g. 10 or -5"
                  />
                </Field>
                <Field label="Type">
                  <Select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                  >
                    <option value="RESTOCK">Restock / Add inventory</option>
                    <option value="ADJUSTMENT">Stock take adjustment</option>
                  </Select>
                </Field>
              </div>
              <Field label="Reason / Notes" hint="Optional">
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Supplier delivery, audit count"
                />
              </Field>

              <ErrorNote message={error} />

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={busy}>
                  {busy ? "Adjusting..." : "Apply Adjustment"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStockModal(null)}>
                  Close
                </Button>
              </div>
            </form>

            <div className="mt-6 border-t border-hairline pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Stock Movement Log</h3>
              {trxLogs.length === 0 ? (
                <p className="mt-2 text-xs text-ink-muted">No stock movements recorded yet.</p>
              ) : (
                <div className="mt-2 max-h-40 overflow-y-auto space-y-2 pr-1">
                  {trxLogs.map((l) => (
                    <div key={l.id} className="flex items-center justify-between gap-2 rounded-xl bg-clay/40 px-3 py-2 text-xs">
                      <div>
                        <span className="font-semibold text-foreground">
                          {l.quantity > 0 ? `+${l.quantity}` : l.quantity} ({l.type})
                        </span>
                        <p className="text-[10px] text-ink-muted mt-0.5">{l.reason || "Manual Adjustment"}</p>
                      </div>
                      <span className="text-[10px] text-ink-muted">
                        {new Date(l.createdAt).toLocaleDateString(undefined, { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
