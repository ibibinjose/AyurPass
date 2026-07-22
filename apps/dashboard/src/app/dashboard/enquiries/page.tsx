"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Enquiry } from "@/lib/types";
import { DashHeader, DashTabs } from "@/components/dashboard/DashboardKit";
import { Button, EmptyState } from "@/components/ui";
import { useMyEnquiries, useUpdateEnquiryStatus } from "@/hooks/useEnquiries";

type Filter = "new" | "all" | "archived";

const STATUS_STYLE: Record<Enquiry["status"], string> = {
  new: "bg-forest text-white",
  read: "bg-gold-soft text-forest",
  archived: "bg-clay text-ink-secondary",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default function EnquiriesPage() {
  const enquiriesQ = useMyEnquiries();
  const updateStatus = useUpdateEnquiryStatus();
  const enquiries =
    enquiriesQ.isLoading && !enquiriesQ.data ? null : (enquiriesQ.data ?? []);
  const [filter, setFilter] = useState<Filter>("new");
  const error = enquiriesQ.isError;

  function setStatus(id: string, status: Enquiry["status"]) {
    updateStatus.mutate({ id, status });
  }

  const counts = useMemo(() => {
    const list = enquiries ?? [];
    return {
      new: list.filter((e) => e.status === "new").length,
      all: list.length,
      archived: list.filter((e) => e.status === "archived").length,
    };
  }, [enquiries]);

  const shown = (enquiries ?? []).filter((e) => {
    if (filter === "new") return e.status !== "archived";
    if (filter === "archived") return e.status === "archived";
    return true;
  });

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "new", label: "Inbox" },
    { key: "all", label: "All" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="Sales"
        title="Enquiries"
        description="Leads from your public practice page. Reply from your own inbox — the visitor’s email is right here."
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-forest text-white"
                : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
            }`}
          >
            {f.label}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                filter === f.key ? "bg-white/20 text-white" : "bg-clay text-ink-secondary"
              }`}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {error ? (
          <EmptyState
            title="We couldn't load your enquiries"
            body="Please refresh the page in a moment."
          />
        ) : enquiries === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            title={filter === "archived" ? "Nothing archived" : "No enquiries yet"}
            body="When someone reaches out from your listing page, their message will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {shown.map((e) => (
              <li
                key={e.id}
                className={`rounded-2xl border bg-surface p-5 ${
                  e.status === "new" ? "border-leaf/50" : "border-hairline"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      {e.name}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[e.status]}`}
                      >
                        {e.status}
                      </span>
                    </p>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-ink-secondary">
                      <a href={`mailto:${e.email}`} className="hover:text-forest hover:underline">
                        {e.email}
                      </a>
                      {e.phone && (
                        <a href={`tel:${e.phone}`} className="hover:text-forest hover:underline">
                          {e.phone}
                        </a>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-ink-muted">{timeAgo(e.createdAt)}</span>
                </div>

                {e.retreat && (
                  <Link
                    href={`/retreats/${e.retreat.slug}`}
                    className="mt-2 inline-block rounded-full bg-clay px-2.5 py-0.5 text-xs text-ink-secondary hover:text-forest"
                  >
                    About retreat: {e.retreat.title}
                  </Link>
                )}

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">
                  {e.message}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${e.email}?subject=${encodeURIComponent("Re: your enquiry")}`}
                    className="inline-flex items-center rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-white hover:bg-forest-deep"
                  >
                    Reply
                  </a>
                  {e.status === "new" && (
                    <Button variant="ghost" onClick={() => setStatus(e.id, "read")}>
                      Mark read
                    </Button>
                  )}
                  {e.status !== "archived" ? (
                    <Button variant="ghost" onClick={() => setStatus(e.id, "archived")}>
                      Archive
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => setStatus(e.id, "new")}>
                      Reopen
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
