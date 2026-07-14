"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { CATEGORY_LABEL } from "@/lib/catalog";
import type { Service, ServiceCategory } from "@/lib/types";
import { ServiceCard } from "@/components/ServiceCard";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

const CATEGORIES: ServiceCategory[] = ["AYURVEDA", "YOGA", "SPA", "MEDITATION", "CONSULTATION"];

interface FormState {
  id?: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: string;
  price: string;
  isVirtual: boolean;
  maxParticipants: string;
}

const BLANK: FormState = {
  name: "",
  category: "AYURVEDA",
  description: "",
  durationMinutes: "60",
  price: "",
  isVirtual: false,
  maxParticipants: "1",
};

export default function ProviderServicesPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [services, setServices] = useState<Service[] | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .servicesByProvider(provider.id)
      .then(setServices)
      .catch(() => setServices([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return (
      <EmptyState
        title="No practice linked"
        body="Sessions are managed by provider accounts."
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
      category: form.category,
      description: form.description || undefined,
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
      isVirtual: form.isVirtual,
      maxParticipants: Number(form.maxParticipants) || 1,
    };
    try {
      if (form.id) {
        await api.updateService(form.id, payload);
      } else {
        await api.createService({ ...payload, providerId: provider.id });
      }
      setForm(null);
      reload();
    } catch {
      setError("The session couldn't be saved. Please check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(s: Service) {
    if (!window.confirm(`Delete “${s.name}”? Existing bookings keep their records.`)) return;
    try {
      await api.deleteService(s.id);
      reload();
    } catch {
      setError("This session has bookings attached and can't be deleted.");
    }
  }

  const own = (services ?? []).filter((s) => s.category !== "PACKAGE");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-forest">Sessions</h1>
          <p className="mt-1 text-ink-muted">
            The bookable consultations, classes and treatments your practice offers.
          </p>
        </div>
        {!form && (
          <Button onClick={() => setForm(BLANK)}>
            <PlusIcon className="h-4 w-4" />
            New session
          </Button>
        )}
      </div>

      {form && (
        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-2xl border border-hairline bg-surface p-6"
        >
          <h2 className="font-display text-xl text-forest">
            {form.id ? "Edit session" : "New session"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Abhyanga Full-Body Massage"
              />
            </Field>
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ServiceCategory })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What happens in this session, and who is it for?"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Duration (minutes)">
              <Input
                required
                type="number"
                min="5"
                step="5"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              />
            </Field>
            <Field label="Price (USD)">
              <Input
                required
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="95"
              />
            </Field>
            <Field label="Max participants">
              <Input
                type="number"
                min="1"
                value={form.maxParticipants}
                onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.isVirtual}
              onChange={(e) => setForm({ ...form, isVirtual: e.target.checked })}
              className="h-4 w-4 accent-(--forest)"
            />
            This session is held virtually (video)
          </label>
          <ErrorNote message={error} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : form.id ? "Save changes" : "Publish session"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {services === null ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : own.length === 0 && !form ? (
          <EmptyState
            title="No sessions yet"
            body="Publish your first bookable session — a consultation, a yoga class, a spa treatment or a guided meditation."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {own.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                actions={
                  <div className="flex gap-2">
                    <button
                      title="Edit"
                      onClick={() =>
                        setForm({
                          id: s.id,
                          name: s.name,
                          category: s.category,
                          description: s.description ?? "",
                          durationMinutes: String(s.durationMinutes),
                          price: String(Number(s.price)),
                          isVirtual: s.isVirtual,
                          maxParticipants: String(s.maxParticipants),
                        })
                      }
                      className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-leaf hover:text-forest"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => remove(s)}
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
