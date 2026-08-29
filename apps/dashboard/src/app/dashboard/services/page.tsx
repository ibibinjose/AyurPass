"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import {
  AYURVEDA_CONDITIONS,
  AYURVEDA_THERAPIES,
  CATEGORY_LABEL,
} from "@/lib/catalog";
import type { Service, ServiceCategory } from "@/lib/types";
import {
  DashCard,
  DashFormActions,
  DashHeader,
  DashQuickLinks,
} from "@/components/dashboard/DashboardKit";
import { MediaField } from "@/components/MediaField";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";
import {
  useInvalidateProviderServices,
  useProviderServices,
  useProviderTeam,
} from "@/hooks/useProviderCatalog";

const CATEGORIES: ServiceCategory[] = [
  "AYURVEDA",
  "YOGA",
  "SPA",
  "MEDITATION",
  "FITNESS",
  "NUTRITION",
  "COOKING",
  "COACHING",
  "CONSULTATION",
  "PACKAGE",
];

interface FormState {
  id?: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: string;
  bufferMinutes: string;
  price: string;
  isVirtual: boolean;
  maxParticipants: string;
  professionalId: string;
  imageUrl: string;
}

const BLANK: FormState = {
  name: "",
  category: "AYURVEDA",
  description: "",
  durationMinutes: "60",
  bufferMinutes: "15",
  price: "",
  isVirtual: false,
  maxParticipants: "1",
  professionalId: "",
  imageUrl: "",
};

export default function ProviderServicesPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const providerId = provider?.id;

  const servicesQ = useProviderServices(providerId);
  const teamQ = useProviderTeam(providerId);
  const invalidateServices = useInvalidateProviderServices(providerId);

  const services =
    servicesQ.isLoading && !servicesQ.data ? null : (servicesQ.data ?? []);
  const team = teamQ.data ?? [];
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ServiceCategory | "ALL">("ALL");

  const reload = () => {
    void invalidateServices();
    void teamQ.refetch();
  };

  if (!provider) {
    return (
      <EmptyState title="No practice linked" body="Sessions are managed by provider accounts." />
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !provider) return;
    setBusy(true);
    setError(null);
    const existing = form.id ? (services?.find((s) => s.id === form.id)?.doshaCompatibility as any) : null;
    const doshaCompatibility = {
      ...(existing && typeof existing === "object" ? existing : {}),
      bufferMinutes: Number(form.bufferMinutes) || 0,
    };
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || undefined,
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
      isVirtual: form.isVirtual,
      maxParticipants: Number(form.maxParticipants) || 1,
      professionalId: form.professionalId || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      doshaCompatibility,
    };
    try {
      if (form.id) {
        await api.updateService(form.id, {
          name: payload.name,
          category: payload.category,
          description: payload.description,
          durationMinutes: payload.durationMinutes,
          price: payload.price,
          isVirtual: payload.isVirtual,
          maxParticipants: payload.maxParticipants,
          professionalId: form.professionalId || null,
          imageUrl: form.imageUrl.trim() || null,
          doshaCompatibility: payload.doshaCompatibility,
        } as Partial<Service>);
      } else {
        await api.createService({
          ...payload,
          providerId: provider.id,
        });
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
  const shown = filter === "ALL" ? own : own.filter((s) => s.category === filter);

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="Catalogue"
        title="Sessions"
        description="Bookable consultations, classes and treatments. Optionally pin a default therapist — the calendar can still reassign rooms and staff per booking."
        action={
          !form ? (
            <Button onClick={() => setForm(BLANK)}>
              <PlusIcon className="h-4 w-4" />
              New session
            </Button>
          ) : null
        }
      />

      <DashQuickLinks
        items={[
          {
            href: "/dashboard/calendar",
            title: "Calendar",
            body: "Schedule multi-therapist sessions",
          },
          { href: "/dashboard/team", title: "Team", body: "Assign practitioners to sessions" },
          { href: "/dashboard/packages", title: "Packages", body: "Multi-session programmes" },
        ]}
      />

      {form && (
        <DashCard
          title={form.id ? "Edit session" : "New session"}
          description="Clear names and durations help clients book with confidence."
        >
          <form onSubmit={submit} className="space-y-4">
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
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as ServiceCategory })
                  }
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
                placeholder="What happens in this session, and who is it for? Mention therapies (Shirodhara) or conditions (IBS) so seekers can find you."
              />
            </Field>
            {form.category === "AYURVEDA" || form.category === "SPA" || form.category === "CONSULTATION" ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                  Quick Ayurvedic therapies
                </p>
                <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                  {AYURVEDA_THERAPIES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setForm((f) => {
                          if (!f) return f;
                          const name = f.name.trim() || t.label;
                          const desc = f.description.includes(t.label)
                            ? f.description
                            : [f.description.trim(), t.label].filter(Boolean).join(" · ");
                          return {
                            ...f,
                            name,
                            category: f.category === "SPA" ? f.category : "AYURVEDA",
                            description: desc,
                          };
                        });
                      }}
                      className="rounded-full border border-hairline bg-clay/40 px-2.5 py-1 text-[11px] font-semibold text-forest hover:border-leaf hover:bg-leaf/10"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                  Conditions often supported
                </p>
                <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                  {AYURVEDA_CONDITIONS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setForm((f) => {
                          if (!f) return f;
                          if (f.description.includes(t.label)) return f;
                          return {
                            ...f,
                            description: [f.description.trim(), `Supports: ${t.label}`]
                              .filter(Boolean)
                              .join(". "),
                          };
                        });
                      }}
                      className="rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink-secondary hover:border-leaf hover:text-forest"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
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
              <Field label="Price">
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
            <Field
              label="Prep & Clean-up Buffer"
              hint="Window reserved after treatment to sanitize rooms, replace linens, and prepare herbal oils before the next client."
            >
              <Select
                value={form.bufferMinutes}
                onChange={(e) => setForm({ ...form, bufferMinutes: e.target.value })}
              >
                <option value="0">No buffer (0 mins)</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes (Standard oil clean-up)</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes (Deep sanitization & herbal steam)</option>
              </Select>
            </Field>
            <Field
              label="Default practitioner"
              hint="Optional. Clients and the calendar can still use other team members."
            >
              <Select
                value={form.professionalId}
                onChange={(e) => setForm({ ...form, professionalId: e.target.value })}
              >
                <option value="">Any available team member</option>
                {team.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.fullName ?? p.title ?? "Practitioner"}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={form.isVirtual}
                onChange={(e) => setForm({ ...form, isVirtual: e.target.checked })}
                className="h-4 w-4 accent-(--forest)"
              />
              Virtual session (video)
            </label>
            <MediaField
              label="Session image"
              shape="rect"
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              hint="Upload or paste a URL for the Explore card."
            />
            <ErrorNote message={error} />
            <DashFormActions>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : form.id ? "Save changes" : "Publish session"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setForm(null)}>
                Cancel
              </Button>
            </DashFormActions>
          </form>
        </DashCard>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
            filter === "ALL" ? "bg-forest text-white" : "border border-hairline text-ink-secondary"
          }`}
        >
          All ({own.length})
        </button>
        {CATEGORIES.map((c) => {
          const n = own.filter((s) => s.category === c).length;
          if (!n) return null;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                filter === c ? "bg-forest text-white" : "border border-hairline text-ink-secondary"
              }`}
            >
              {CATEGORY_LABEL[c]} ({n})
            </button>
          );
        })}
      </div>

      {services === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-clay/70" />
          ))}
        </div>
      ) : shown.length === 0 && !form ? (
        <EmptyState
          title="No sessions yet"
          body="Publish your first bookable session — consultation, yoga class, spa treatment or meditation."
          action={
            <Button onClick={() => setForm(BLANK)}>
              <PlusIcon className="h-4 w-4" />
              New session
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {shown.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-surface px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
                    {CATEGORY_LABEL[s.category]}
                  </span>
                  {(s.doshaCompatibility as any)?.bufferMinutes ? (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-forest-deep">
                      +{(s.doshaCompatibility as any).bufferMinutes}m buffer
                    </span>
                  ) : null}
                  {s.isVirtual ? (
                    <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
                      Virtual
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm font-medium text-ink-muted">
                  {s.durationMinutes} min
                  {(s.doshaCompatibility as any)?.bufferMinutes
                    ? ` (+${(s.doshaCompatibility as any).bufferMinutes}m clean-up)`
                    : ""}{" "}
                  · {formatMoney(s.price, s.currency)}
                  {s.professional?.user?.fullName
                    ? ` · ${s.professional.user.fullName}`
                    : s.professionalId
                      ? " · Assigned practitioner"
                      : " · Any team member"}
                </p>
                {s.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">{s.description}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/book/${s.id}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-hairline px-3 text-xs font-semibold text-forest hover:border-leaf"
                >
                  Preview
                </Link>
                <button
                  type="button"
                  title="Edit"
                  onClick={() =>
                    setForm({
                      id: s.id,
                      name: s.name,
                      category: s.category,
                      description: s.description ?? "",
                      durationMinutes: String(s.durationMinutes),
                      bufferMinutes: String((s.doshaCompatibility as any)?.bufferMinutes ?? "15"),
                      price: String(Number(s.price)),
                      isVirtual: s.isVirtual,
                      maxParticipants: String(s.maxParticipants),
                      professionalId: s.professionalId ?? "",
                      imageUrl: s.imageUrl ?? "",
                    })
                  }
                  className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-leaf hover:text-forest"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => void remove(s)}
                  className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-red-300 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
