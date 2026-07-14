"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { AdminProvider } from "@/lib/types";
import { Button, EmptyState } from "@/components/ui";

const STATUS_STYLE: Record<string, string> = {
  verified: "bg-forest text-white",
  pending: "bg-gold-soft text-forest",
  rejected: "bg-red-50 text-red-700",
};

export default function AdminProvidersPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<AdminProvider[] | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const reload = useCallback(() => {
    api
      .adminProviders()
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  useEffect(reload, [reload]);

  if (user && user.role !== "PLATFORM_ADMIN") {
    return <EmptyState title="Admin only" body="This area is for platform administrators." />;
  }

  async function setStatus(p: AdminProvider, status: "verified" | "rejected" | "pending") {
    setActing(p.id);
    try {
      await api.adminSetVerification(p.id, status);
      reload();
    } finally {
      setActing(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Providers</h1>
      <p className="mt-1 text-ink-muted">Verify practices before they appear as trusted.</p>

      <div className="mt-8">
        {providers === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
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
                      disabled={acting === p.id}
                      onClick={() => setStatus(p, "verified")}
                      className="!px-3.5 !py-1.5"
                    >
                      Verify
                    </Button>
                  )}
                  {p.verificationStatus !== "rejected" && (
                    <Button
                      variant="danger"
                      disabled={acting === p.id}
                      onClick={() => setStatus(p, "rejected")}
                      className="!px-3.5 !py-1.5"
                    >
                      Reject
                    </Button>
                  )}
                  {p.verificationStatus !== "pending" && (
                    <Button
                      variant="ghost"
                      disabled={acting === p.id}
                      onClick={() => setStatus(p, "pending")}
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
