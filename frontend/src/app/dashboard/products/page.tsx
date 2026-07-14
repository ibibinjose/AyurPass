"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Textarea } from "@/components/ui";

interface FormState {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: string;
  inventoryQuantity: string;
}

const BLANK: FormState = { name: "", category: "", description: "", price: "", inventoryQuantity: "" };

export default function ProviderProductsPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
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
          <h1 className="font-display text-3xl text-forest">Products</h1>
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
                          inventoryQuantity: p.inventoryQuantity != null ? String(p.inventoryQuantity) : "",
                        })
                      }
                      className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-leaf hover:text-forest"
                    >
                      <PencilIcon className="h-4 w-4" />
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
    </div>
  );
}
