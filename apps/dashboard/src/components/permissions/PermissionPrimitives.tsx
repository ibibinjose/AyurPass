"use client";

import type { ReactNode } from "react";
import type { ClientConsent, ConsentEffectiveStatus } from "@/lib/types";
import { formatConsentDate, permissionDefinition } from "@/lib/permissions";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui";
import { ShieldIcon } from "@/components/icons";

/** Shared status pill for consent / permission lifecycle. */
export function PermissionStatusBadge({ status }: { status: ConsentEffectiveStatus | string }) {
  const key: ConsentEffectiveStatus =
    status === "active" || status === "revoked" || status === "expired"
      ? status
      : "expired";
  const tone =
    key === "active" ? "success" : key === "revoked" ? "danger" : "neutral";
  return <StatusBadge label={key} tone={tone} />;
}

/** Section chrome shared by permission request surfaces. */
export function PermissionSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white shadow-xs">
              <ShieldIcon className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg text-forest">{title}</h2>
          </div>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Compact permission type chip used in lists and request forms. */
export function PermissionTypeChip({ type }: { type: string }) {
  const def = permissionDefinition(type);
  return (
    <span className="inline-flex items-center rounded-full border border-hairline bg-clay/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
      {def.shortLabel}
    </span>
  );
}

/**
 * Shared card for a single granted (or historical) permission.
 * Used by the consumer privacy dashboard and any future grant-request flows.
 */
export function PermissionRequestCard({
  consent,
  busy,
  onRevoke,
  onRenew,
}: {
  consent: ClientConsent;
  busy?: boolean;
  onRevoke?: (consent: ClientConsent) => void;
  onRenew?: (consent: ClientConsent) => void;
}) {
  const def = permissionDefinition(consent.permissionType);
  const active = consent.effectiveStatus === "active" && !consent.isExpired;
  const granteeName = consent.grantee?.name ?? "Unknown practice";
  const granteeKind =
    consent.grantee?.kind === "professional"
      ? consent.grantee.title || "Practitioner"
      : consent.grantee?.kind === "provider"
        ? "Practice"
        : null;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-5 shadow-[0_2px_12px_rgba(36,56,46,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(36,56,46,0.07)] sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <PermissionTypeChip type={consent.permissionType} />
          <PermissionStatusBadge status={consent.effectiveStatus} />
        </div>
        <h3 className="font-display text-base text-foreground">{def.title}</h3>
        <p className="text-sm leading-relaxed text-ink-secondary">{def.description}</p>
        <dl className="mt-2 grid gap-1 text-sm text-ink-muted sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide">Shared with</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {granteeName}
              {granteeKind ? (
                <span className="font-normal text-ink-muted"> · {granteeKind}</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide">Expires</dt>
            <dd className="mt-0.5">{formatConsentDate(consent.expiresAt)}</dd>
          </div>
          {consent.scope && typeof consent.scope === "object" && "bookingId" in consent.scope ? (
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide">Scope</dt>
              <dd className="mt-0.5">
                Booking-linked
                {Array.isArray(consent.scope.dataCategories)
                  ? ` · ${(consent.scope.dataCategories as string[]).join(", ").replace(/_/g, " ")}`
                  : null}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
        {active && onRevoke ? (
          <Button
            type="button"
            variant="danger"
            disabled={busy}
            onClick={() => onRevoke(consent)}
            className="whitespace-nowrap"
          >
            {busy ? "Revoking…" : "Revoke access"}
          </Button>
        ) : null}
        {!active && onRenew ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => onRenew(consent)}
            className="whitespace-nowrap"
          >
            {busy ? "Working…" : "Grant again"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

/** Empty / loading states that match other permission surfaces. */
export function PermissionEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-hairline bg-clay/25 px-6 py-10 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-forest text-white shadow-xs">
        <ShieldIcon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-display text-lg text-forest">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

export function PermissionListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-clay/60" />
      ))}
    </div>
  );
}

/**
 * Request form for granting a permission to a practice / practitioner.
 * Shared structure so future “request access” flows stay consistent.
 */
export function PermissionGrantForm({
  permissionType,
  granteeLabel,
  onConfirm,
  onCancel,
  busy,
  error,
}: {
  permissionType: string;
  granteeLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  error?: string | null;
}) {
  const def = permissionDefinition(permissionType);
  return (
    <div className="rounded-2xl border border-hairline bg-clay/30 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
        Permission request
      </p>
      <h3 className="mt-1 font-display text-lg text-forest">{def.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{def.description}</p>
      <p className="mt-3 text-sm text-ink-muted">
        Grant to <span className="font-medium text-foreground">{granteeLabel}</span>
      </p>
      {error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={onConfirm} disabled={busy}>
          {busy ? "Granting…" : "Allow access"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
