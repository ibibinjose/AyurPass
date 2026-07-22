"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { TreatmentPlan, TreatmentPlanPhase } from "@/lib/types";
import { practicePath, practitionerPath, professionalDisplayTitle } from "@/lib/paths";
import {
  DashCard,
  DashHeader,
  DashTabs,
} from "@/components/dashboard/DashboardKit";
import { SparkleIcon, ShieldIcon, UsersIcon, CalendarIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote } from "@/components/ui";

type StatusFilter = "all" | "active" | "completed" | "draft" | "paused";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-forest text-white",
  completed: "bg-leaf/20 text-forest",
  draft: "bg-clay text-ink-secondary",
  paused: "bg-gold-soft text-forest",
  cancelled: "bg-red-50 text-red-700",
};

function asPhases(raw: unknown): TreatmentPlanPhase[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as TreatmentPlanPhase[];
  if (typeof raw === "object" && raw !== null && Array.isArray((raw as { phases?: unknown }).phases)) {
    return (raw as { phases: TreatmentPlanPhase[] }).phases;
  }
  return [];
}

function formatRange(start?: string | null, end?: string | null) {
  const fmt = (d: string) =>
    new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(d),
    );
  if (!start && !end) return null;
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end!)}`;
}

function PlanCard({
  plan,
  perspective,
  expanded,
  onToggle,
}: {
  plan: TreatmentPlan;
  perspective: "consumer" | "provider";
  expanded: boolean;
  onToggle: () => void;
}) {
  const phases = asPhases(plan.phases);
  const range = formatRange(plan.startDate, plan.endDate);
  const status = (plan.status || "draft").toLowerCase();
  const practiceName = plan.provider?.businessName;
  const proName =
    plan.professional?.user?.fullName ||
    professionalDisplayTitle(plan.professional ?? {}) ||
    plan.professional?.title;
  const clientName = plan.consumer?.user?.fullName || plan.consumer?.user?.email || "Client";

  return (
    <li className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_2px_12px_rgba(36,56,46,0.04)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-clay/20 sm:p-6"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest text-gold-soft">
          <SparkleIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-lg font-semibold text-forest">
              {plan.name?.trim() || "Personalised plan"}
            </p>
            {plan.aiGenerated ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
                <SparkleIcon className="h-3 w-3" /> AI-assisted
              </span>
            ) : null}
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                STATUS_STYLE[status] ?? STATUS_STYLE.draft
              }`}
            >
              {status}
            </span>
          </div>
          {plan.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-relaxed text-ink-secondary">
              {plan.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-ink-muted">
            {perspective === "consumer" && practiceName ? (
              <span className="inline-flex items-center gap-1">
                <UsersIcon className="h-3.5 w-3.5" />
                {practiceName}
                {proName ? ` · ${proName}` : ""}
              </span>
            ) : null}
            {perspective === "provider" ? (
              <span className="inline-flex items-center gap-1">
                <UsersIcon className="h-3.5 w-3.5" />
                Client: {clientName}
              </span>
            ) : null}
            {range ? (
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                {range}
              </span>
            ) : null}
            {phases.length > 0 ? (
              <span>
                {phases.length} phase{phases.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 text-xs font-bold text-[var(--system-blue)]">
          {expanded ? "Hide" : "View"}
        </span>
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-hairline bg-clay/15 px-5 py-5 sm:px-6">
          {plan.description ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Overview</p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-relaxed text-ink-secondary">
                {plan.description}
              </p>
            </div>
          ) : null}

          {phases.length > 0 ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Phases</p>
              <ol className="mt-3 space-y-3">
                {phases.map((ph, i) => {
                  const title = ph.name || ph.title || `Phase ${i + 1}`;
                  const therapies = ph.therapies?.filter(Boolean) ?? [];
                  const lifestyle = ph.lifestyle?.filter(Boolean) ?? [];
                  const diet = ph.diet?.filter(Boolean) ?? [];
                  return (
                    <li
                      key={ph.id ?? `${title}-${i}`}
                      className="rounded-xl border border-hairline bg-surface p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-forest">{title}</p>
                          {ph.focus ? (
                            <p className="mt-0.5 text-xs font-medium text-ink-muted">Focus: {ph.focus}</p>
                          ) : null}
                          {ph.durationDays ? (
                            <p className="mt-0.5 text-xs font-medium text-ink-muted">
                              ~{ph.durationDays} days
                            </p>
                          ) : null}
                          {ph.description || ph.notes ? (
                            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                              {ph.description || ph.notes}
                            </p>
                          ) : null}
                          {therapies.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {therapies.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full bg-leaf/15 px-2.5 py-0.5 text-[11px] font-semibold text-forest"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {(lifestyle.length > 0 || diet.length > 0) && (
                            <div className="mt-2 space-y-1 text-xs font-medium text-ink-muted">
                              {lifestyle.length > 0 ? (
                                <p>Lifestyle: {lifestyle.join(" · ")}</p>
                              ) : null}
                              {diet.length > 0 ? <p>Diet: {diet.join(" · ")}</p> : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <p className="text-sm font-medium text-ink-muted">
              No structured phases yet — your practitioner may add them after your next session.
            </p>
          )}

          <div className="flex flex-wrap gap-2 border-t border-hairline pt-4">
            {perspective === "consumer" && plan.provider ? (
              <Link
                href={practicePath(plan.provider)}
                className="inline-flex min-h-9 items-center rounded-full border border-hairline px-3 text-xs font-semibold text-forest hover:border-leaf"
              >
                View practice
              </Link>
            ) : null}
            {perspective === "consumer" && plan.professional ? (
              <Link
                href={practitionerPath(plan.professional)}
                className="inline-flex min-h-9 items-center rounded-full border border-hairline px-3 text-xs font-semibold text-forest hover:border-leaf"
              >
                View practitioner
              </Link>
            ) : null}
            {perspective === "consumer" ? (
              <Link
                href="/dashboard/permissions"
                className="inline-flex min-h-9 items-center rounded-full border border-hairline px-3 text-xs font-semibold text-forest hover:border-leaf"
              >
                Manage who can see this
              </Link>
            ) : null}
            {perspective === "provider" ? (
              <Link
                href="/dashboard/bookings"
                className="inline-flex min-h-9 items-center rounded-full border border-hairline px-3 text-xs font-semibold text-forest hover:border-leaf"
              >
                Related bookings
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

function SharingExplainer({ forProvider }: { forProvider: boolean }) {
  return (
    <DashCard
      title="How plans are shared"
      description="Treatment plans are private health records — access is consent-based."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {(forProvider
          ? [
              {
                icon: SparkleIcon,
                title: "You create",
                body: "After a consultation, your practice authors a plan linked to the client and (optionally) a practitioner.",
              },
              {
                icon: ShieldIcon,
                title: "Client controls access",
                body: "Clients grant “Treatment plans” or broader health permissions from Privacy & permissions. Without a grant, other practices cannot read their plans.",
              },
              {
                icon: UsersIcon,
                title: "Care continuity",
                body: "When a client books with you and grants access, you can view plans they share — supporting safe, coordinated care.",
              },
            ]
          : [
              {
                icon: SparkleIcon,
                title: "Your practitioner designs",
                body: "Plans are created by a practice after consultation — phases, therapies and lifestyle guidance tailored to you.",
              },
              {
                icon: ShieldIcon,
                title: "You own the data",
                body: "Plans live on your account. Only you and parties you grant permission to can open them.",
              },
              {
                icon: UsersIcon,
                title: "Share with care teams",
                body: "From Privacy & permissions, grant “Treatment plans” (or full health access) to a trusted practice. Revoke anytime.",
              },
            ]
        ).map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-hairline bg-clay/25 px-4 py-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-gold-soft">
              <item.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm font-bold text-forest">{item.title}</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-ink-muted">{item.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!forProvider ? (
          <Link
            href="/dashboard/permissions"
            className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-deep"
          >
            Open Privacy & permissions
          </Link>
        ) : (
          <Link
            href="/dashboard/permissions"
            className="inline-flex min-h-10 items-center rounded-full border border-hairline px-4 text-sm font-semibold text-forest hover:border-leaf"
          >
            How client consents work
          </Link>
        )}
        <Link
          href="/privacy"
          className="inline-flex min-h-10 items-center rounded-full border border-hairline px-4 text-sm font-semibold text-forest hover:border-leaf"
        >
          Privacy Policy
        </Link>
      </div>
      <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-xs font-medium leading-relaxed text-ink-muted">
        <strong className="text-forest">Permission type:</strong>{" "}
        <code className="rounded bg-clay px-1.5 py-0.5 text-[11px]">view_treatment_plans</code>
        {" — "}
        listed in your privacy dashboard. Broader{" "}
        <code className="rounded bg-clay px-1.5 py-0.5 text-[11px]">full_health_access</code> may
        also include plans. Access is audited when care teams open health data.
      </p>
    </DashCard>
  );
}

export default function TreatmentPlansPage() {
  const { user } = useAuth();
  const isConsumer = user?.role === "CONSUMER";
  const isProvider =
    user?.role === "PROVIDER_ADMIN" ||
    user?.role === "PROFESSIONAL" ||
    user?.role === "PLATFORM_ADMIN";
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [plans, setPlans] = useState<TreatmentPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const providerId = provider?.id;

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      if (isConsumer) {
        setPlans(await api.plansByConsumer(user.id));
      } else if (providerId) {
        setPlans(await api.plansByProvider(providerId));
      } else {
        setPlans([]);
      }
    } catch {
      setPlans([]);
      setError("We couldn't load treatment plans right now.");
    }
  }, [user, isConsumer, providerId]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) void load();
    };
    run();
    return () => {
      active = false;
    };
  }, [load]);

  const filtered = useMemo(() => {
    if (!plans) return [];
    if (filter === "all") return plans;
    return plans.filter((p) => (p.status || "").toLowerCase() === filter);
  }, [plans, filter]);

  const counts = useMemo(() => {
    const c = { all: 0, active: 0, completed: 0, draft: 0, paused: 0 };
    for (const p of plans ?? []) {
      c.all += 1;
      const s = (p.status || "draft").toLowerCase();
      if (s in c) c[s as keyof typeof c] += 1;
    }
    return c;
  }, [plans]);

  const perspective = isConsumer ? "consumer" : "provider";

  if (user && !isConsumer && !provider) {
    return (
      <div className="space-y-6">
        <DashHeader
          eyebrow="Care"
          title="Treatment plans"
          description="Structured programs for clients — phases, therapies and lifestyle guidance."
        />
        <EmptyState
          title="No practice linked"
          body="Treatment plans are managed by provider accounts. Link a practice to create and share plans with clients who grant access."
        />
        <SharingExplainer forProvider />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <DashHeader
        eyebrow="Care"
        title="Treatment plans"
        description={
          isConsumer
            ? "Personalised programs from your practitioners — private by default, shareable with consent."
            : "Programs you design for clients. Clients control who else may view them."
        }
        action={
          isConsumer ? (
            <Link
              href="/dashboard/permissions"
              className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest hover:border-leaf"
            >
              Privacy settings
            </Link>
          ) : (
            <Link
              href="/dashboard/bookings"
              className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest hover:border-leaf"
            >
              Bookings
            </Link>
          )
        }
      />

      <SharingExplainer forProvider={!isConsumer && Boolean(isProvider)} />

      <ErrorNote message={error} />

      {(plans?.length ?? 0) > 0 ? (
        <DashTabs
          tabs={[
            { id: "all", label: "All", count: counts.all },
            { id: "active", label: "Active", count: counts.active },
            { id: "completed", label: "Completed", count: counts.completed },
            { id: "draft", label: "Draft", count: counts.draft },
            { id: "paused", label: "Paused", count: counts.paused },
          ]}
          value={filter}
          onChange={(id) => setFilter(id as StatusFilter)}
        />
      ) : null}

      <div>
        {plans === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              filter === "all"
                ? isConsumer
                  ? "No treatment plans yet"
                  : "No client plans yet"
                : `No ${filter} plans`
            }
            body={
              isConsumer
                ? "After a consultation, your practitioner can design a personalised program. Phases, therapies and lifestyle guidance will appear here — and stay private until you share them."
                : "When you create a plan for a client (after a booking or consultation), it will appear here. The client must grant treatment-plan access for other parties to view their history."
            }
            action={
              isConsumer ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Link
                    href="/explore"
                    className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white"
                  >
                    Book a session
                  </Link>
                  <Link
                    href="/dashboard/permissions"
                    className="inline-flex min-h-10 items-center rounded-full border border-hairline px-4 text-sm font-semibold text-forest"
                  >
                    Review permissions
                  </Link>
                </div>
              ) : (
                <Link
                  href="/dashboard/calendar"
                  className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white"
                >
                  Open calendar
                </Link>
              )
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                perspective={perspective}
                expanded={openId === p.id}
                onToggle={() => setOpenId((id) => (id === p.id ? null : p.id))}
              />
            ))}
          </ul>
        )}
      </div>

      {isConsumer && (plans?.length ?? 0) > 0 ? (
        <p className="text-center text-xs font-medium text-ink-muted">
          Need to stop a practice from seeing plans?{" "}
          <Link href="/dashboard/permissions" className="font-semibold text-forest hover:underline">
            Revoke access in Privacy & permissions
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
