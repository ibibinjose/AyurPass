"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatRetreatDates, RETREAT_CATEGORIES, RETREAT_CATEGORY_LABEL } from "@/lib/catalog";
import type { Retreat, RetreatCategory, RetreatInput } from "@/lib/types";
import { MediaGalleryField } from "@/components/MediaField";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

const SKILL_LEVELS = ["All levels", "Beginner", "Intermediate", "Advanced"];

function splitList(value: string): string[] {
  return value.split(",").map((v) => v.trim()).filter(Boolean).slice(0, 20);
}
function splitLines(value: string): string[] {
  return value.split(/[\n,]/).map((v) => v.trim()).filter(Boolean).slice(0, 20);
}
function toDateInput(iso?: string | null): string {
  return iso ? new Date(iso).toISOString().slice(0, 10) : "";
}

const EMPTY = {
  title: "",
  category: "YOGA_RETREAT" as RetreatCategory,
  summary: "",
  description: "",
  city: "",
  country: "",
  startDate: "",
  endDate: "",
  durationDays: "",
  priceFrom: "",
  currency: "USD",
  capacity: "",
  skillLevel: "All levels",
  images: "",
  highlights: "",
  inclusions: "",
  externalBookingUrl: "",
  status: "published",
};

export default function DashboardRetreatsPage() {
  const [retreats, setRetreats] = useState<Retreat[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.myRetreats().then(setRetreats).catch(() => setRetreats([]));
  }
  useEffect(load, []);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError(null);
    setShowForm(true);
  }

  function startEdit(r: Retreat) {
    setEditingId(r.id);
    setForm({
      title: r.title,
      category: r.category,
      summary: r.summary ?? "",
      description: r.description ?? "",
      city: r.city ?? "",
      country: r.country ?? "",
      startDate: toDateInput(r.startDate),
      endDate: toDateInput(r.endDate),
      durationDays: r.durationDays != null ? String(r.durationDays) : "",
      priceFrom: r.priceFrom != null ? String(r.priceFrom) : "",
      currency: r.currency ?? "USD",
      capacity: r.capacity != null ? String(r.capacity) : "",
      skillLevel: r.skillLevel ?? "All levels",
      images: (r.images ?? []).join("\n"),
      highlights: (r.highlights ?? []).join(", "),
      inclusions: (r.inclusions ?? []).join(", "),
      externalBookingUrl: r.externalBookingUrl ?? "",
      status: r.status ?? "published",
    });
    setError(null);
    setShowForm(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const payload: RetreatInput = {
      title: form.title,
      category: form.category,
      summary: form.summary || undefined,
      description: form.description || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      durationDays: form.durationDays ? Number(form.durationDays) : undefined,
      priceFrom: form.priceFrom ? Number(form.priceFrom) : undefined,
      currency: form.currency || "USD",
      capacity: form.capacity ? Number(form.capacity) : undefined,
      skillLevel: form.skillLevel || undefined,
      images: splitLines(form.images),
      highlights: splitList(form.highlights),
      inclusions: splitList(form.inclusions),
      externalBookingUrl: form.externalBookingUrl || undefined,
      status: form.status,
    };
    try {
      if (editingId) await api.updateRetreat(editingId, payload);
      else await api.createRetreat(payload);
      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY });
      load();
    } catch {
      setError("We couldn't save this retreat. Check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    setRetreats((prev) => prev?.filter((r) => r.id !== id) ?? prev);
    try {
      await api.deleteRetreat(id);
    } catch {
      load();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
            Catalogue
          </p>
          <h1 className="mt-1 font-display text-3xl text-forest">Retreats &amp; trainings</h1>
          <p className="mt-1 text-ink-muted">
            Publish multi-day programs to the AyurPass retreat directory.
          </p>
        </div>
        {!showForm && <Button onClick={startCreate}>Add retreat</Button>}
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="mt-6 space-y-5 rounded-2xl border border-hairline bg-surface p-6">
          <h2 className="font-display text-lg text-forest">
            {editingId ? "Edit retreat" : "New retreat"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="7-Day Panchakarma Detox" />
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => set("category", e.target.value as RetreatCategory)}>
                {RETREAT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{RETREAT_CATEGORY_LABEL[c]}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Summary" hint="One-line hook shown on cards.">
            <Input value={form.summary} onChange={(e) => set("summary", e.target.value)} placeholder="A week of authentic Ayurvedic cleansing by the sea." />
          </Field>
          <Field label="Description">
            <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Goa" /></Field>
            <Field label="Country"><Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="India" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
            <Field label="End date"><Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></Field>
            <Field label="Duration (days)"><Input type="number" min={1} value={form.durationDays} onChange={(e) => set("durationDays", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price from"><Input type="number" min={0} value={form.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} placeholder="1200" /></Field>
            <Field label="Currency"><Input value={form.currency} onChange={(e) => set("currency", e.target.value)} /></Field>
            <Field label="Capacity"><Input type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="16" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Skill level">
              <Select value={form.skillLevel} onChange={(e) => set("skillLevel", e.target.value)}>
                {SKILL_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Visibility">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
          </div>
          <MediaGalleryField
            label="Retreat photos"
            values={form.images
              .split(/[\n,]/)
              .map((s) => s.trim())
              .filter(Boolean)}
            onChange={(urls) => set("images", urls.join("\n"))}
            hint="Upload or paste URLs — first image is the cover."
            max={12}
          />
          <Field label="Highlights" hint="Comma separated.">
            <Input value={form.highlights} onChange={(e) => set("highlights", e.target.value)} placeholder="Daily yoga, Ocean-view rooms, Ayurvedic meals" />
          </Field>
          <Field label="What's included" hint="Comma separated.">
            <Input value={form.inclusions} onChange={(e) => set("inclusions", e.target.value)} placeholder="Accommodation, All meals, Airport transfer" />
          </Field>
          <Field label="External booking link" hint="Where guests book directly (optional).">
            <Input type="url" value={form.externalBookingUrl} onChange={(e) => set("externalBookingUrl", e.target.value)} placeholder="https://…" />
          </Field>

          <ErrorNote message={error} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : editingId ? "Save changes" : "Publish retreat"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {retreats === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : retreats.length === 0 ? (
          <EmptyState
            title="No retreats yet"
            body="Publish your first multi-day program to appear in the AyurPass retreat directory."
          />
        ) : (
          <ul className="space-y-3">
            {retreats.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                    {r.title}
                    {r.featured && (
                      <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-forest-deep">
                        Handpicked
                      </span>
                    )}
                    {r.status === "draft" && (
                      <span className="rounded-full bg-clay px-2 py-0.5 text-[11px] font-semibold uppercase text-ink-secondary">
                        Draft
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {RETREAT_CATEGORY_LABEL[r.category]} · {formatRetreatDates(r.startDate, r.endDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/retreats/${r.slug}`}
                    className="inline-flex items-center rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-sm font-medium text-forest hover:border-leaf"
                  >
                    View
                  </Link>
                  <Button variant="ghost" onClick={() => startEdit(r)}>Edit</Button>
                  <Button variant="danger" onClick={() => onDelete(r.id)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
