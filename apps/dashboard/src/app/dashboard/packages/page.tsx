"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { WellnessPackage } from "@/lib/types";
import { PackageCard } from "@/components/PackageCard";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Textarea } from "@/components/ui";

interface FormState {
  id?: string;
  name: string;
  description: string;
  totalPrice: string;
  durationDays: string;
  isRecurring: boolean;
}

const BLANK: FormState = { name: "", description: "", totalPrice: "", durationDays: "", isRecurring: false };

export default function ProviderPackagesPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [packages, setPackages] = useState<WellnessPackage[] | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .packagesByProvider(provider.id)
      .then(setPackages)
      .catch(() => setPackages([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return (
      <EmptyState
        title="No practice linked"
        body="Packages are managed by provider accounts. Register as a provider to curate wellness programs."
      />
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !provider) return;
    setBusy(true);
    setError(null);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      totalPrice: Number(form.totalPrice),
      durationDays: form.durationDays ? Number(form.durationDays) : undefined,
      isRecurring: form.isRecurring,
    };
    try {
      if (form.id) {
        await api.updatePackage(form.id, payload);
      } else {
        await api.createPackage({ ...payload, providerId: provider.id });
      }
      setForm(null);
      reload();
    } catch {
      setError("The package couldn't be saved. Please check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(pkg: WellnessPackage) {
    if (!window.confirm(`Delete “${pkg.name}”? This cannot be undone.`)) return;
    try {
      await api.deletePackage(pkg.id);
      reload();
    } catch {
      setError("The package couldn't be deleted right now.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
            Catalogue
          </p>
          <h1 className="mt-1 font-display text-3xl text-forest">Packages</h1>
          <p className="mt-1 text-ink-muted">The wellness programs your practice offers.</p>
        </div>
        {!form && (
          <Button onClick={() => setForm(BLANK)}>
            <PlusIcon className="h-4 w-4" />
            New package
          </Button>
        )}
      </div>

      {form && (
        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-2xl border border-hairline bg-surface p-6"
        >
          <h2 className="font-display text-xl text-forest">
            {form.id ? "Edit package" : "New package"}
          </h2>
          <Field label="Name">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="7-Day Panchakarma Reset"
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What does this program include, and who is it for?"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Total price">
              <Input
                required
                type="number"
                min="0"
                step="1"
                value={form.totalPrice}
                onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
                placeholder="1200"
              />
            </Field>
            <Field label="Duration (days)" hint="Optional">
              <Input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                placeholder="7"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
              className="h-4 w-4 accent-(--forest)"
            />
            This is a recurring program (e.g. monthly membership)
          </label>
          <ErrorNote message={error} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : form.id ? "Save changes" : "Publish package"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {packages === null ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : packages.length === 0 && !form ? (
          <EmptyState
            title="No packages yet"
            body="Publish your first wellness program — it will appear instantly in the public collection for clients to discover."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {packages?.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                actions={
                  <div className="flex gap-2">
                    <button
                      title="Edit"
                      onClick={() =>
                        setForm({
                          id: pkg.id,
                          name: pkg.name,
                          description: pkg.description ?? "",
                          totalPrice: String(Number(pkg.totalPrice)),
                          durationDays: pkg.durationDays ? String(pkg.durationDays) : "",
                          isRecurring: pkg.isRecurring,
                        })
                      }
                      className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-leaf hover:text-forest"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => remove(pkg)}
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
