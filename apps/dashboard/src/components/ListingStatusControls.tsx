"use client";

import type { ListingStatus } from "@/lib/types";

export function listingStatusOf(value?: string | null): ListingStatus {
  if (value === "paused" || value === "closed") return value;
  return "live";
}

export function ListingStatusBadge({ status }: { status?: string | null }) {
  const s = listingStatusOf(status);
  const styles =
    s === "live"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
      : s === "paused"
        ? "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
        : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300";
  const label = s === "live" ? "Live" : s === "paused" ? "Paused" : "Closed";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles}`}>
      {label}
    </span>
  );
}

export function confirmListingStatusChange(
  entityLabel: string,
  next: ListingStatus,
): boolean {
  if (next === "paused") {
    return window.confirm(
      `Pause ${entityLabel}? It will be hidden from Discover and public pages. Existing future bookings stay — new bookings and enquiries will be blocked. You can reopen anytime.`,
    );
  }
  if (next === "closed") {
    return window.confirm(
      `Close ${entityLabel}? This archives the listing (soft-close — nothing is deleted). It stays hidden from the public catalog until you reopen it to Live.`,
    );
  }
  return window.confirm(`Reopen ${entityLabel} to Live? It will become publicly discoverable and bookable again where applicable.`);
}
