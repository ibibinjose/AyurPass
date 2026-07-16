"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { OFFER_DISCIPLINES } from "@/lib/catalog";
import type { Offer, OfferInput } from "@/lib/types";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

const EMPTY = {
  title: "",
  description: "",
  discipline: "General",
  discountLabel: "",
  code: "",
  imageUrl: "",
  ctaLabel: "",
  ctaUrl: "",
  featured: false,
  active: true,
  startDate: "",
  endDate: "",
};

function toDateInput(iso?: string | null): string {
  return iso ? new Date(iso).toISOString().slice(0, 10) : "";
}

export default function AdminOffersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "PLATFORM_ADMIN";

  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.adminOffers().then(setOffers).catch(() => setOffers([]));
  }
  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError(null);
    setShowForm(true);
  }

  function startEdit(o: Offer) {
    setEditingId(o.id);
    setForm({
      title: o.title,
      description: o.description ?? "",
      discipline: o.discipline ?? "General",
      discountLabel: o.discountLabel ?? "",
      code: o.code ?? "",
      imageUrl: o.imageUrl ?? "",
      ctaLabel: o.ctaLabel ?? "",
      ctaUrl: o.ctaUrl ?? "",
      featured: o.featured,
      active: o.active,
      startDate: toDateInput(o.startDate),
      endDate: toDateInput(o.endDate),
    });
    setError(null);
    setShowForm(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const payload: OfferInput = {
      title: form.title,
      description: form.description || undefined,
      discipline: form.discipline || undefined,
      discountLabel: form.discountLabel || undefined,
      code: form.code || undefined,
      imageUrl: form.imageUrl || undefined,
      ctaLabel: form.ctaLabel || undefined,
      ctaUrl: form.ctaUrl || undefined,
      featured: form.featured,
      active: form.active,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    try {
      if (editingId) await api.updateOffer(editingId, payload);
      else await api.createOffer(payload);
      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY });
      load();
    } catch {
      setError("We couldn't save this offer. Check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(o: Offer, key: "active" | "featured") {
    setOffers((prev) => prev?.map((x) => (x.id === o.id ? { ...x, [key]: !x[key] } : x)) ?? prev);
    try {
      await api.updateOffer(o.id, { [key]: !o[key] });
    } catch {
      load();
    }
  }

  async function onDelete(id: string) {
    setOffers((prev) => prev?.filter((o) => o.id !== id) ?? prev);
    try {
      await api.deleteOffer(id);
    } catch {
      load();
    }
  }

  if (!isAdmin) {
    return (
      <EmptyState title="Admins only" body="Offer management is available to platform admins." />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-forest">Offers &amp; promotions</h1>
          <p className="mt-1 text-ink-muted">
            Create and promote deals across every wellness discipline.
          </p>
        </div>
        {!showForm && <Button onClick={startCreate}>Create offer</Button>}
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="mt-6 space-y-5 rounded-2xl border border-hairline bg-surface p-6">
          <h2 className="font-display text-lg text-forest">
            {editingId ? "Edit offer" : "New offer"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Summer Panchakarma — 20% off" />
            </Field>
            <Field label="Discipline">
              <Select value={form.discipline} onChange={(e) => set("discipline", e.target.value)}>
                {OFFER_DISCIPLINES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Discount badge" hint='e.g. "20% OFF", "2-for-1"'>
              <Input value={form.discountLabel} onChange={(e) => set("discountLabel", e.target.value)} />
            </Field>
            <Field label="Promo code (optional)">
              <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="AYUR20" />
            </Field>
          </div>
          <Field label="Image URL">
            <Input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button label" hint="What the call-to-action says.">
              <Input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} placeholder="Shop the deal" />
            </Field>
            <Field label="Link (CTA URL)" hint="A provider, product, retreat, /discover filter, or external URL.">
              <Input value={form.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} placeholder="/retreats or https://…" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts (optional)"><Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
            <Field label="Ends (optional)"><Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></Field>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured (handpicked)
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
              Active (visible publicly)
            </label>
          </div>

          <ErrorNote message={error} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : editingId ? "Save changes" : "Publish offer"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {offers === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <EmptyState title="No offers yet" body="Create your first promotion to spotlight it across AyurPass." />
        ) : (
          <ul className="space-y-3">
            {offers.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                    {o.title}
                    {o.discountLabel && (
                      <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-forest-deep">
                        {o.discountLabel}
                      </span>
                    )}
                    {o.featured && (
                      <span className="rounded-full bg-forest px-2 py-0.5 text-[11px] font-semibold text-white">
                        Featured
                      </span>
                    )}
                    {!o.active && (
                      <span className="rounded-full bg-clay px-2 py-0.5 text-[11px] font-semibold uppercase text-ink-secondary">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">{o.discipline ?? "General"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => toggle(o, "active")}>
                    {o.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" onClick={() => toggle(o, "featured")}>
                    {o.featured ? "Un-feature" : "Feature"}
                  </Button>
                  <Button variant="ghost" onClick={() => startEdit(o)}>Edit</Button>
                  <Button variant="danger" onClick={() => onDelete(o.id)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
