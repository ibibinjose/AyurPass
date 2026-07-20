"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { AccessAuditEntry, ClientConsent } from "@/lib/types";
import { formatConsentDate, permissionDefinition } from "@/lib/permissions";
import {
  PermissionEmptyState,
  PermissionListSkeleton,
  PermissionRequestCard,
  PermissionSection,
} from "@/components/permissions/PermissionPrimitives";
import { ErrorNote } from "@/components/ui";

type Filter = "all" | "active" | "revoked" | "expired";

export default function PermissionsPage() {
  const { user } = useAuth();
  const [consents, setConsents] = useState<ClientConsent[] | null>(null);
  const [audit, setAudit] = useState<AccessAuditEntry[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConsumer = user?.role === "CONSUMER";

  const load = useCallback(async () => {
    if (!user || !isConsumer) return;
    setError(null);
    try {
      const [c, a] = await Promise.all([api.myConsents(), api.myAccessAudit()]);
      setConsents(c);
      setAudit(a);
    } catch {
      setConsents([]);
      setAudit([]);
      setError("We couldn't load your privacy settings right now.");
    }
  }, [user, isConsumer]);

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
    if (!consents) return [];
    if (filter === "all") return consents;
    return consents.filter((c) => c.effectiveStatus === filter);
  }, [consents, filter]);

  const counts = useMemo(() => {
    const base = { all: 0, active: 0, revoked: 0, expired: 0 };
    for (const c of consents ?? []) {
      base.all += 1;
      base[c.effectiveStatus] += 1;
    }
    return base;
  }, [consents]);

  async function revoke(consent: ClientConsent) {
    if (
      !window.confirm(
        `Revoke “${permissionDefinition(consent.permissionType).title}” for ${
          consent.grantee?.name ?? "this party"
        }? They will lose access immediately.`,
      )
    ) {
      return;
    }
    setBusyId(consent.id);
    setError(null);
    try {
      await api.revokeConsent(consent.id);
      await load();
    } catch {
      setError("Revoke failed — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function renew(consent: ClientConsent) {
    if (!user) return;
    setBusyId(consent.id);
    setError(null);
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + 90);
      await api.createConsent({
        consumerId: user.id,
        granteeId: consent.granteeId ?? undefined,
        permissionType: consent.permissionType,
        scope: (consent.scope as Record<string, unknown>) ?? undefined,
        expiresAt: expires.toISOString(),
      });
      await load();
    } catch {
      setError("Could not re-grant this permission. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (user && !isConsumer) {
    return (
      <div>
        <h1 className="font-display text-3xl text-forest">Privacy & permissions</h1>
        <p className="mt-2 max-w-xl text-ink-muted">
          Health-data permissions are managed by consumers. As a provider you only see data
          when a client has an active grant for your practice.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
          Account
        </p>
        <h1 className="font-display text-3xl text-forest">Privacy & permissions</h1>
        <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-ink-muted">
          Control who can see your dosha profile, health history and treatment plans. Grants are
          created when you book a session and can be revoked at any time.
        </p>
      </header>

      <ErrorNote message={error} />

      <PermissionSection
        title="Active & past grants"
        description="Each card is a permission you have shared with a practice or practitioner."
        action={
          <div className="flex flex-wrap gap-1.5">
            {(["all", "active", "revoked", "expired"] as Filter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  filter === key
                    ? "bg-forest text-white"
                    : "border border-hairline bg-surface text-ink-secondary hover:border-leaf"
                }`}
              >
                {key} ({counts[key]})
              </button>
            ))}
          </div>
        }
      >
        {consents === null ? (
          <PermissionListSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <PermissionEmptyState
            title={filter === "all" ? "No permissions yet" : `No ${filter} permissions`}
            body={
              filter === "all"
                ? "When you book a session, AyurPass creates a time-limited health-data grant for that practice. It will appear here."
                : "Try another filter, or book a session to create a new grant."
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((consent) => (
              <PermissionRequestCard
                key={consent.id}
                consent={consent}
                busy={busyId === consent.id}
                onRevoke={revoke}
                onRenew={renew}
              />
            ))}
          </div>
        )}
      </PermissionSection>

      <PermissionSection
        title="Access activity"
        description="Recent reads of your health profile. Every sensitive access is logged."
      >
        {audit === null ? (
          <PermissionListSkeleton count={2} />
        ) : audit.length === 0 ? (
          <PermissionEmptyState
            title="No access logged yet"
            body="When a practitioner or admin views your health profile, the event appears here."
          />
        ) : (
          <ul className="divide-y divide-hairline rounded-2xl border border-hairline">
            {audit.slice(0, 25).map((entry) => (
              <li
                key={String(entry.id)}
                className="flex flex-col gap-1 px-4 py-3.5 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {entry.action} · {entry.resourceType}
                    {entry.purpose ? (
                      <span className="font-normal text-ink-muted"> · {entry.purpose.replace(/_/g, " ")}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Accessor {entry.accessorId ? `${entry.accessorId.slice(0, 8)}…` : "unknown"}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-ink-muted" dateTime={entry.timestamp}>
                  {formatConsentDate(entry.timestamp)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </PermissionSection>

      <p className="text-xs leading-relaxed text-ink-muted">
        Tip: revoking access does not cancel bookings. It only stops further health-data
        reads. New bookings will create fresh time-limited grants.
      </p>
    </div>
  );
}
