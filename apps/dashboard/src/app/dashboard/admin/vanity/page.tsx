"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button, EmptyState, ErrorNote } from "@/components/ui";
import { DashHeader } from "@/components/dashboard/DashboardKit";

type VanityRow = {
  kind: "professional" | "provider";
  id: string;
  handle: string | null;
  status: string;
  requestedAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  displayName: string;
  subtitle: string;
  pathPreview: string | null;
  namespacedPath: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold-soft text-forest",
  approved: "bg-forest text-white",
  rejected: "bg-red-50 text-red-700",
};

export default function AdminVanityPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<VanityRow[] | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const reload = useCallback(() => {
    api
      .adminVanityRequests()
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  useEffect(reload, [reload]);

  if (user && user.role !== "PLATFORM_ADMIN") {
    return (
      <EmptyState title="Admin only" body="Root vanity approval is limited to platform admins." />
    );
  }

  async function review(row: VanityRow, status: "approved" | "rejected" | "pending") {
    let note: string | undefined;
    if (status === "rejected") {
      const entered =
        typeof window !== "undefined"
          ? window.prompt(
              `Deny @${row.handle ?? "handle"}? Optional reason shown to the practice:`,
              row.reviewNote ?? "",
            )
          : null;
      if (entered === null) return; // cancelled
      note = entered.trim() || undefined;
    }
    setActing(`${row.kind}-${row.id}`);
    setError(null);
    try {
      await api.adminReviewVanity(row.kind, row.id, status, note);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update vanity request.");
    } finally {
      setActing(null);
    }
  }

  const list =
    rows?.filter((r) => (filter === "pending" ? r.status === "pending" : true)) ?? null;

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="Admin"
        title="Root vanity handles"
        description="Approve or deny short brand URLs (www.ayurpass.com/yourhandle) for practices and practitioners. Only approved handles are live — protects trademarks, celebrities and reserved paths."
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "pending" as const, label: "Pending" },
            { id: "all" as const, label: "All" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              filter === t.id ? "bg-forest text-white" : "border border-hairline text-ink-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ErrorNote message={error} />

      {list === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title={filter === "pending" ? "No pending requests" : "No vanity requests yet"}
          body="When practitioners or practices request a root username, they appear here for approval."
        />
      ) : (
        <ul className="space-y-3">
          {list.map((row) => {
            const key = `${row.kind}-${row.id}`;
            return (
              <li
                key={key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                    <span className="truncate">{row.displayName}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        STATUS_STYLE[row.status] ?? STATUS_STYLE.pending
                      }`}
                    >
                      {row.status}
                    </span>
                    <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
                      {row.kind}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {row.subtitle}
                    {row.handle ? (
                      <>
                        {" · "}
                        <span className="font-mono font-semibold text-forest">
                          /{row.handle}
                        </span>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs font-medium text-ink-muted">
                    {row.namespacedPath ? (
                      <Link href={row.namespacedPath} className="hover:text-forest hover:underline">
                        Current: {row.namespacedPath}
                      </Link>
                    ) : (
                      "No namespaced path"
                    )}
                    {row.requestedAt
                      ? ` · Requested ${new Date(row.requestedAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.status !== "approved" ? (
                    <Button
                      type="button"
                      disabled={acting === key}
                      onClick={() => void review(row, "approved")}
                    >
                      Approve
                    </Button>
                  ) : null}
                  {row.status !== "rejected" ? (
                    <Button
                      type="button"
                      variant="danger"
                      disabled={acting === key}
                      onClick={() => void review(row, "rejected")}
                    >
                      Deny
                    </Button>
                  ) : null}
                  {row.status !== "pending" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={acting === key}
                      onClick={() => void review(row, "pending")}
                    >
                      Reset pending
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
