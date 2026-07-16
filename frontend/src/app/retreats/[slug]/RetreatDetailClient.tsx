"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, formatMoney } from "@/lib/api";
import { formatRetreatDates, RETREAT_CATEGORY_LABEL } from "@/lib/catalog";
import { practicePath } from "@/lib/paths";
import type { Retreat } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { EnquireModal } from "@/components/EnquireModal";
import { Button, EmptyState } from "@/components/ui";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  MapPinIcon,
  ShieldIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper>
      <div className="mx-auto w-full max-w-5xl px-5 py-10">{children}</div>
    </LayoutWrapper>
  );
}

export default function RetreatDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [retreat, setRetreat] = useState<Retreat | null | undefined>(undefined);
  const [enquireOpen, setEnquireOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .retreatBySlug(slug)
      .then(setRetreat)
      .catch(() => setRetreat(null));
  }, [slug]);

  if (retreat === null) {
    return (
      <Shell>
        <EmptyState title="Retreat not found" body="This retreat may have been removed." />
        <div className="mt-6 text-center">
          <Link href="/retreats" className="font-medium text-forest hover:underline">
            ← Back to retreats
          </Link>
        </div>
      </Shell>
    );
  }

  if (retreat === undefined) {
    return (
      <Shell>
        <div className="h-64 animate-pulse rounded-3xl bg-clay/70" />
      </Shell>
    );
  }

  const isAdmin = user?.role === "PLATFORM_ADMIN";
  const cover = retreat.images?.[0];
  const rest = (retreat.images ?? []).slice(1);
  const location = [retreat.city, retreat.country].filter(Boolean).join(", ");
  const highlights = retreat.highlights ?? [];
  const inclusions = retreat.inclusions ?? [];
  const verified = retreat.verificationStatus === "verified";

  async function curate(patch: { featured?: boolean; verificationStatus?: string }) {
    if (!retreat) return;
    const updated = await api.curateRetreat(retreat.id, patch);
    setRetreat(updated);
  }

  return (
    <Shell>
      <Link href="/retreats" className="text-sm text-ink-muted hover:text-forest">
        ← Back to retreats
      </Link>

      {/* Hero */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-hairline bg-surface">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-64 w-full object-cover sm:h-80" />
        ) : (
          <div
            aria-hidden
            className="h-40 w-full bg-[linear-gradient(120deg,var(--color-forest),var(--color-leaf))]"
          />
        )}
        <div className="p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-leaf">
              {RETREAT_CATEGORY_LABEL[retreat.category] ?? retreat.category}
            </span>
            {retreat.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-forest-deep">
                <SparkleIcon className="h-3.5 w-3.5" />
                Handpicked
              </span>
            )}
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-forest">
                <ShieldIcon className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl text-forest sm:text-4xl">{retreat.title}</h1>
          {retreat.summary && <p className="mt-2 max-w-2xl text-ink-secondary">{retreat.summary}</p>}

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-secondary">
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-leaf" />
                {location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-leaf" />
              {formatRetreatDates(retreat.startDate, retreat.endDate)}
              {retreat.durationDays ? ` · ${retreat.durationDays} days` : ""}
            </span>
            {retreat.skillLevel && (
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-leaf" />
                {retreat.skillLevel}
              </span>
            )}
            {retreat.capacity != null && (
              <span className="inline-flex items-center gap-1.5">
                <UsersIcon className="h-4 w-4 text-leaf" />
                Up to {retreat.capacity} guests
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div>
              {retreat.priceFrom != null ? (
                <p className="text-sm text-ink-muted">
                  from{" "}
                  <span className="font-display text-2xl text-forest">
                    {formatMoney(retreat.priceFrom, retreat.currency)}
                  </span>
                </p>
              ) : (
                <p className="font-display text-xl text-forest">Price on request</p>
              )}
            </div>
            <Button onClick={() => setEnquireOpen(true)}>Enquire now</Button>
            {retreat.externalBookingUrl && (
              <a
                href={retreat.externalBookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-forest hover:border-leaf"
              >
                Book directly
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Admin curation */}
      {isAdmin && (
        <section className="mt-6 rounded-2xl border border-dashed border-hairline bg-surface p-5">
          <p className="text-sm font-semibold text-forest">Platform admin — curation</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => curate({ featured: !retreat.featured })}>
              {retreat.featured ? "Un-feature" : "Handpick (feature)"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => curate({ verificationStatus: verified ? "pending" : "verified" })}
            >
              {verified ? "Mark unverified" : "Verify"}
            </Button>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {retreat.description && (
            <section>
              <h2 className="font-display text-2xl text-forest">About this retreat</h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink-secondary">
                {retreat.description}
              </p>
            </section>
          )}

          {highlights.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-2xl text-forest">Highlights</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {highlights.map((h) => (
                  <li key={h} className="inline-flex items-start gap-2 text-sm text-ink-secondary">
                    <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {rest.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-2xl text-forest">Gallery</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {rest.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-48 w-full rounded-2xl border border-hairline object-cover"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {inclusions.length > 0 && (
            <section className="rounded-2xl border border-hairline bg-surface p-5">
              <h3 className="font-display text-lg text-forest">What's included</h3>
              <ul className="mt-3 space-y-2">
                {inclusions.map((i) => (
                  <li key={i} className="inline-flex items-start gap-2 text-sm text-ink-secondary">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                    {i}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {retreat.provider && (
            <section className="rounded-2xl border border-hairline bg-surface p-5">
              <h3 className="font-display text-lg text-forest">Hosted by</h3>
              <p className="mt-2 text-sm text-ink-secondary">{retreat.provider.businessName}</p>
              <Link
                href={practicePath(retreat.provider)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:underline"
              >
                View host profile
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </section>
          )}
        </aside>
      </div>

      {retreat.provider && (
        <EnquireModal
          open={enquireOpen}
          onClose={() => setEnquireOpen(false)}
          providerId={retreat.providerId}
          businessName={retreat.provider.businessName}
          retreatId={retreat.id}
        />
      )}
    </Shell>
  );
}
