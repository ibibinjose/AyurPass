import type { Offer } from "@/lib/types";

/** Human-readable validity window for an offer. */
export function formatOfferValidity(
  startDate?: string | null,
  endDate?: string | null,
): string | null {
  if (!startDate && !endDate) return null;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, opts);
  };
  if (startDate && endDate) return `${fmt(startDate)} – ${fmt(endDate)}`;
  if (endDate) return `Ends ${fmt(endDate)}`;
  return `From ${fmt(startDate!)}`;
}

/** True when endDate is in the past (gracefully ignores invalid/missing). */
export function isOfferExpired(offer: Pick<Offer, "endDate">): boolean {
  if (!offer.endDate) return false;
  const end = new Date(offer.endDate);
  if (Number.isNaN(end.getTime())) return false;
  // End of that calendar day still counts as valid.
  end.setHours(23, 59, 59, 999);
  return end.getTime() < Date.now();
}

/** Days left until endDate, or null if unknown/unlimited. */
export function offerDaysLeft(endDate?: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return null;
  end.setHours(23, 59, 59, 999);
  const ms = end.getTime() - Date.now();
  if (ms < 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
