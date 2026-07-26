"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { AdminProvider } from "@/lib/types";
import { Button, EmptyState } from "@/components/ui";
import { useAdminProviders, useSetProviderVerification } from "@/hooks/useAdminProviders";
import { CheckIcon, ShieldIcon } from "@/components/icons";

const STATUS_STYLE: Record<string, string> = {
  verified: "bg-emerald-600 text-white",
  pending: "bg-amber-400 text-amber-950 font-bold",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200",
};

type StatusFilter = "all" | "pending" | "verified" | "rejected";

export default function AdminProvidersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "PLATFORM_ADMIN";
  const { data: providers, isLoading, isError, refetch, isFetching } = useAdminProviders(isAdmin);
  const verify = useSetProviderVerification();

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (user && !isAdmin) {
    return <EmptyState title="Admin only" body="This area is for platform administrators." />;
  }

  const list = providers ?? [];
  const pendingCount = useMemo(() => list.filter((p) => p.verificationStatus === "pending").length, [list]);
  const verifiedCount = useMemo(() => list.filter((p) => p.verificationStatus === "verified").length, [list]);
  const rejectedCount = useMemo(() => list.filter((p) => p.verificationStatus === "rejected").length, [list]);

  const filteredProviders = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((p) => p.verificationStatus === filter);
  }, [list, filter]);

  async function setStatus(p: AdminProvider, status: "verified" | "rejected" | "pending") {
    await verify.mutateAsync({ providerId: p.id, status });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-forest">Provider Verification & Approvals</h1>
          <p className="mt-1 text-ink-muted">
            Inspect practitioner credentials, operating permits, and uploaded qualification documents to grant verification.
          </p>
        </div>
        <Button
          variant="ghost"
          className="!px-3.5 !py-1.5"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "Refreshing…" : "Refresh List"}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-hairline pb-4">
        {[
          { id: "all" as const, label: `All Practices (${list.length})` },
          { id: "pending" as const, label: `Pending Review (${pendingCount})`, badge: pendingCount > 0 },
          { id: "verified" as const, label: `Verified (${verifiedCount})` },
          { id: "rejected" as const, label: `Rejected (${rejectedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              filter === tab.id
                ? "bg-forest text-white shadow-sm"
                : "border border-hairline bg-surface text-ink-secondary hover:border-leaf"
            }`}
          >
            {tab.label}
            {tab.badge && filter !== tab.id ? (
              <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading || providers === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Couldn't load providers"
            body="Check that the backend API is running, then refresh."
          />
        ) : filteredProviders.length === 0 ? (
          <EmptyState
            title={`No ${filter === "all" ? "" : filter} providers`}
            body="Practice listings will appear here as they register or submit verification credentials."
          />
        ) : (
          <ul className="space-y-4">
            {filteredProviders.map((p) => {
              const isExpanded = expandedId === p.id;
              const docs = Array.isArray((p.brandProfile as any)?.verificationDocs)
                ? ((p.brandProfile as any).verificationDocs as { url: string; name: string }[])
                : [];
              const healthAuths = Array.isArray(p.healthAuthorities) ? p.healthAuthorities : [];

              return (
                <li
                  key={p.id}
                  className="rounded-3xl border border-hairline bg-surface p-5 shadow-sm transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display text-lg font-semibold text-forest">
                          {p.businessName}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            STATUS_STYLE[p.verificationStatus] ?? STATUS_STYLE.pending
                          }`}
                        >
                          {p.verificationStatus}
                        </span>
                      </div>

                      <p className="text-xs text-ink-muted">
                        {PROVIDER_TYPE_LABEL[p.type] ?? p.type} · Account Owner:{" "}
                        <strong className="text-foreground">{p.user?.fullName ?? "Unassigned"}</strong> (
                        {p.user?.email ?? "No email"})
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-ink-secondary">
                        <span>Staff: {p._count.professionals}</span>
                        <span>Sessions: {p._count.services}</span>
                        <span>Rooms: {p._count.rooms}</span>
                        <span>Bookings: {p._count.bookings}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.verificationStatus !== "verified" && (
                        <Button
                          disabled={verify.isPending && verify.variables?.providerId === p.id}
                          onClick={() => void setStatus(p, "verified")}
                          className="!px-4 !py-1.5 !text-xs"
                        >
                          Approve (Verify)
                        </Button>
                      )}
                      {p.verificationStatus !== "rejected" && (
                        <Button
                          variant="danger"
                          disabled={verify.isPending && verify.variables?.providerId === p.id}
                          onClick={() => void setStatus(p, "rejected")}
                          className="!px-4 !py-1.5 !text-xs"
                        >
                          Reject
                        </Button>
                      )}
                      {p.verificationStatus !== "pending" && (
                        <Button
                          variant="ghost"
                          disabled={verify.isPending && verify.variables?.providerId === p.id}
                          onClick={() => void setStatus(p, "pending")}
                          className="!px-3 !py-1.5 !text-xs"
                        >
                          Reset
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-forest hover:bg-clay/40"
                      >
                        {isExpanded ? "Hide Details" : "View Credentials ↓"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Verification Details */}
                  {isExpanded && (
                    <div className="mt-5 border-t border-hairline pt-4 space-y-3 text-xs">
                      <div className="grid gap-3 sm:grid-cols-2 bg-clay/20 p-4 rounded-2xl">
                        <div>
                          <p className="font-semibold text-ink-muted">AHPRA / Council Registration:</p>
                          <p className="font-mono text-foreground font-medium mt-0.5">
                            {p.registrationNumber || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-ink-muted">Operating Permit / Licence:</p>
                          <p className="font-mono text-foreground font-medium mt-0.5">
                            {p.licenceNumber || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {healthAuths.length > 0 && (
                        <div>
                          <p className="font-semibold text-ink-muted mb-1">Accreditation Boards & Associations:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {healthAuths.map((auth: any, i: number) => (
                              <span
                                key={i}
                                className="rounded-full bg-forest/10 px-3 py-1 font-semibold text-forest text-[11px]"
                              >
                                🌿 {auth.code || auth.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-ink-muted mb-1">Attached Verification Documents:</p>
                        {docs.length > 0 ? (
                          <ul className="space-y-1.5">
                            {docs.map((doc, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-emerald-700">📄</span>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-forest hover:underline"
                                >
                                  {doc.name} ↗
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-ink-muted italic">No uploaded document files attached.</p>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
