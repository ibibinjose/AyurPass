"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type FeedbackCounts, type FeedbackReportRow } from "@/lib/api";
import {
  FEEDBACK_STATUS_LABELS,
  feedbackCategoryLabel,
  type FeedbackStatus,
} from "@/lib/feedback";
import { Button, EmptyState, ErrorNote, Field, Textarea } from "@/components/ui";
import { DashHeader } from "@/components/dashboard/DashboardKit";
import { FlagIcon, SparkleIcon } from "@/components/icons";

const STATUS_STYLE: Record<string, string> = {
  open: "bg-gold-soft text-forest",
  reviewing: "bg-[var(--system-blue)]/15 text-[var(--system-blue)]",
  resolved: "bg-forest text-white",
  dismissed: "bg-clay text-ink-muted",
};

type FilterId = "open" | "reviewing" | "abuse" | "suggestion" | "all" | "resolved";

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<FeedbackReportRow[] | null>(null);
  const [counts, setCounts] = useState<FeedbackCounts | null>(null);
  const [filter, setFilter] = useState<FilterId>("open");
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const reload = useCallback(() => {
    const params =
      filter === "open" || filter === "reviewing" || filter === "resolved"
        ? { status: filter }
        : filter === "abuse" || filter === "suggestion"
          ? { kind: filter }
          : undefined;

    setError(null);
    Promise.all([
      api.adminFeedback(params),
      api.adminFeedbackCounts().catch(() => null),
    ])
      .then(([list, c]) => {
        setRows(list);
        if (c) setCounts(c);
      })
      .catch((e) => {
        setRows([]);
        setError(e instanceof Error ? e.message : "Could not load reports.");
      });
  }, [filter]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) reload();
    };
    run();
    return () => {
      active = false;
    };
  }, [reload]);

  if (user && user.role !== "PLATFORM_ADMIN") {
    return (
      <EmptyState title="Admin only" body="Feedback moderation is limited to platform admins." />
    );
  }

  async function setStatus(
    row: FeedbackReportRow,
    status: FeedbackStatus,
    withNote?: boolean,
  ) {
    setActing(row.id);
    setError(null);
    try {
      const adminNote = withNote ? noteDraft[row.id]?.trim() || undefined : undefined;
      await api.adminUpdateFeedback(row.id, { status, adminNote });
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setActing(null);
    }
  }

  const filters: { id: FilterId; label: string; badge?: number }[] = [
    { id: "open", label: "Open", badge: counts?.open },
    { id: "reviewing", label: "Reviewing", badge: counts?.reviewing },
    { id: "abuse", label: "Abuse", badge: counts?.abuseOpen },
    { id: "suggestion", label: "Suggestions", badge: counts?.suggestionOpen },
    { id: "resolved", label: "Resolved" },
    { id: "all", label: "All", badge: counts?.total },
  ];

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="Admin"
        title="Reports & suggestions"
        description="Abuse reports and product feedback for trust, safety and quality control."
      />

      {counts ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Open", value: counts.open, hint: "Needs triage" },
            { label: "In review", value: counts.reviewing, hint: "Being handled" },
            { label: "Open abuse", value: counts.abuseOpen, hint: "Safety priority" },
            { label: "Total inbox", value: counts.total, hint: "All time" },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-hairline bg-surface px-4 py-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                {c.label}
              </p>
              <p className="mt-1 font-display text-2xl text-forest tabular-nums">{c.value}</p>
              <p className="text-xs font-medium text-ink-muted">{c.hint}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {filters.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              filter === t.id ? "bg-forest text-white" : "border border-hairline text-ink-secondary"
            }`}
          >
            {t.label}
            {t.badge != null && t.badge > 0 ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  filter === t.id ? "bg-white/20 text-white" : "bg-clay text-ink-muted"
                }`}
              >
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <ErrorNote message={error} />

      {rows === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-clay/70" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="Inbox empty" body="New reports and suggestions will appear here." />
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const isOpen = expanded === row.id;
            const contact =
              row.reporter?.fullName ||
              row.reporter?.email ||
              [row.contactName, row.contactEmail].filter(Boolean).join(" · ") ||
              (row.userId ? "Signed-in user" : "Anonymous guest");

            return (
              <li
                key={row.id}
                className="rounded-2xl border border-hairline bg-surface px-5 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                      <span
                        className={`inline-flex items-center gap-1 capitalize ${
                          row.kind === "abuse" ? "text-red-700" : "text-forest"
                        }`}
                      >
                        {row.kind === "abuse" ? (
                          <FlagIcon className="h-3.5 w-3.5" />
                        ) : (
                          <SparkleIcon className="h-3.5 w-3.5" />
                        )}
                        {row.kind}
                      </span>
                      <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
                        {feedbackCategoryLabel(row.kind, row.category)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                          STATUS_STYLE[row.status] ?? STATUS_STYLE.open
                        }`}
                      >
                        {FEEDBACK_STATUS_LABELS[row.status as FeedbackStatus] ?? row.status}
                      </span>
                      <span className="font-mono text-[10px] font-medium text-ink-muted">
                        #{row.id.slice(0, 8)}
                      </span>
                    </p>
                    {row.targetLabel ? (
                      <p className="mt-1 text-xs font-medium text-ink-muted">
                        About:{" "}
                        <span className="text-forest">{row.targetLabel}</span>
                        {row.targetType ? ` · ${row.targetType}` : ""}
                        {row.targetId ? (
                          <span className="font-mono text-[10px]"> · {row.targetId.slice(0, 8)}</span>
                        ) : null}
                      </p>
                    ) : null}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">
                      {row.message}
                    </p>
                    {row.adminNote ? (
                      <p className="mt-2 rounded-xl bg-clay/40 px-3 py-2 text-xs font-medium text-ink-secondary">
                        <span className="font-bold text-forest">Admin note: </span>
                        {row.adminNote}
                      </p>
                    ) : null}
                    <p className="mt-2 text-[11px] font-medium text-ink-muted">
                      {contact}
                      {" · "}
                      {new Date(row.createdAt).toLocaleString()}
                      {row.pageUrl ? (
                        <>
                          {" · "}
                          <a
                            href={row.pageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-forest hover:underline"
                          >
                            Page
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.status !== "reviewing" && row.status !== "resolved" ? (
                      <Button
                        type="button"
                        variant="soft"
                        disabled={acting === row.id}
                        onClick={() => void setStatus(row, "reviewing")}
                      >
                        Reviewing
                      </Button>
                    ) : null}
                    {row.status !== "resolved" ? (
                      <Button
                        type="button"
                        disabled={acting === row.id}
                        onClick={() => void setStatus(row, "resolved", true)}
                      >
                        Resolve
                      </Button>
                    ) : null}
                    {row.status !== "dismissed" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={acting === row.id}
                        onClick={() => void setStatus(row, "dismissed", true)}
                      >
                        Dismiss
                      </Button>
                    ) : null}
                    {(row.status === "resolved" || row.status === "dismissed") && (
                      <Button
                        type="button"
                        variant="soft"
                        disabled={acting === row.id}
                        onClick={() => void setStatus(row, "open")}
                      >
                        Reopen
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setExpanded(isOpen ? null : row.id)}
                    >
                      {isOpen ? "Hide note" : "Note"}
                    </Button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-4 border-t border-hairline pt-4">
                    <Field label="Admin note" hint="Optional — saved when you Resolve or Dismiss, or save alone via Resolve with note.">
                      <Textarea
                        rows={2}
                        maxLength={1000}
                        value={noteDraft[row.id] ?? row.adminNote ?? ""}
                        onChange={(e) =>
                          setNoteDraft((prev) => ({ ...prev, [row.id]: e.target.value }))
                        }
                        placeholder="Internal note for other admins…"
                      />
                    </Field>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="soft"
                        disabled={acting === row.id}
                        onClick={() => void setStatus(row, row.status as FeedbackStatus, true)}
                      >
                        Save note
                      </Button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
