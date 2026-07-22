"use client";

import { useAuth } from "@/context/AuthContext";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { AdminProvider } from "@/lib/types";
import { Button, EmptyState } from "@/components/ui";
import { useAdminProviders, useSetProviderVerification } from "@/hooks/useAdminProviders";

const STATUS_STYLE: Record<string, string> = {
  verified: "bg-forest text-white",
  pending: "bg-gold-soft text-forest",
  rejected: "bg-red-50 text-red-700",
};

export default function AdminProvidersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "PLATFORM_ADMIN";
  const { data: providers, isLoading, isError, refetch, isFetching } = useAdminProviders(isAdmin);
  const verify = useSetProviderVerification();

  if (user && !isAdmin) {
    return <EmptyState title="Admin only" body="This area is for platform administrators." />;
  }

  async function setStatus(p: AdminProvider, status: "verified" | "rejected" | "pending") {
    await verify.mutateAsync({ providerId: p.id, status });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-forest">Providers</h1>
          <p className="mt-1 text-ink-muted">Verify practices before they appear as trusted.</p>
        </div>
        <Button
          variant="ghost"
          className="!px-3.5 !py-1.5"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="mt-8">
        {isLoading || providers === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Couldn't load providers"
            body="Check that the API is running, then refresh."
          />
        ) : providers.length === 0 ? (
          <EmptyState title="No providers yet" body="Practices will appear here as they register." />
        ) : (
          <ul className="space-y-3">
            {providers.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-5 py-4"
              >
                <div>
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    {p.businessName}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[p.verificationStatus] ?? STATUS_STYLE.pending}`}
                    >
                      {p.verificationStatus}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {PROVIDER_TYPE_LABEL[p.type] ?? p.type} · {p.user?.fullName ?? "—"} (
                    {p.user?.email ?? "no user"}) · {p._count.professionals} staff ·{" "}
                    {p._count.services} sessions · {p._count.rooms} rooms · {p._count.bookings}{" "}
                    bookings
                  </p>
                </div>
                <div className="flex gap-2">
                  {p.verificationStatus !== "verified" && (
                    <Button
                      disabled={verify.isPending && verify.variables?.providerId === p.id}
                      onClick={() => void setStatus(p, "verified")}
                      className="!px-3.5 !py-1.5"
                    >
                      Verify
                    </Button>
                  )}
                  {p.verificationStatus !== "rejected" && (
                    <Button
                      variant="danger"
                      disabled={verify.isPending && verify.variables?.providerId === p.id}
                      onClick={() => void setStatus(p, "rejected")}
                      className="!px-3.5 !py-1.5"
                    >
                      Reject
                    </Button>
                  )}
                  {p.verificationStatus !== "pending" && (
                    <Button
                      variant="ghost"
                      disabled={verify.isPending && verify.variables?.providerId === p.id}
                      onClick={() => void setStatus(p, "pending")}
                      className="!px-3.5 !py-1.5"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
