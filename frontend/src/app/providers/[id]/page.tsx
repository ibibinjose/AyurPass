"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatAddress, formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Product, Provider, Service } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ServiceCard } from "@/components/ServiceCard";
import { ProductCard } from "@/components/ProductCard";
import { BrandMark } from "@/components/BrandMark";
import { EnquireModal } from "@/components/EnquireModal";
import { ArrowRightIcon, CheckIcon, MapPinIcon, ShieldIcon } from "@/components/icons";
import { Button, EmptyState } from "@/components/ui";

/** Build a Google Maps search link from a provider's stored address. */
function mapsUrl(provider: Provider): string | null {
  const a = provider.address;
  const parts = [provider.businessName, a?.street, a?.city, a?.state, a?.country]
    .map((p) => p?.trim())
    .filter(Boolean);
  if (parts.length <= 1) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
}

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null | undefined>(undefined);
  const [services, setServices] = useState<Service[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [enquireOpen, setEnquireOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .provider(id)
      .then((p) => setProvider(p ?? null))
      .catch(() => setProvider(null));
    api.servicesByProvider(id).then(setServices).catch(() => setServices([]));
    api.productsByProvider(id).then(setProducts).catch(() => setProducts([]));
  }, [id]);

  if (provider === null) {
    return (
      <Shell>
        <EmptyState title="Practice not found" body="This listing may have been removed." />
        <div className="mt-6 text-center">
          <Link href="/discover" className="font-medium text-forest hover:underline">
            ← Back to discovery
          </Link>
        </div>
      </Shell>
    );
  }

  if (provider === undefined) {
    return (
      <Shell>
        <div className="h-40 animate-pulse rounded-3xl bg-clay/70" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-clay/70" />
          ))}
        </div>
      </Shell>
    );
  }

  const location = formatAddress(provider.address);
  const verified = provider.verificationStatus === "verified";
  const brand = provider.brandProfile;
  const cover = brand?.coverImageUrl;

  const hasBookableServices = (services?.length ?? 0) > 0;
  // Free-listing (or any practice not selling through AyurPass) leads with enquiry + external links.
  const isListing = provider.listingTier === "FREE_LISTING" || !hasBookableServices;

  const gallery = brand?.gallery?.filter(Boolean) ?? [];
  const tags = brand?.tags?.filter(Boolean) ?? [];
  const amenities = brand?.amenities?.filter(Boolean) ?? [];
  const social = brand?.socialLinks;
  const socialEntries = social
    ? (Object.entries(social).filter(([, v]) => Boolean(v)) as [string, string][])
    : [];
  const map = mapsUrl(provider);

  return (
    <Shell>
      <Link href="/discover" className="text-sm text-ink-muted hover:text-forest">
        ← Back to discovery
      </Link>

      {/* Header */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-hairline bg-forest">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-40 w-full object-cover sm:h-52" />
        ) : (
          <div
            aria-hidden
            className="h-24 w-full bg-[linear-gradient(120deg,var(--color-forest),var(--color-leaf))] sm:h-28"
          />
        )}
        <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <BrandMark provider={provider} size="lg" className="-mt-16 ring-2 ring-forest" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl text-white">{provider.businessName}</h1>
                {verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
                    <ShieldIcon className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-sm text-gold-soft">
                <span>{PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}</span>
                {brand?.priceBand && <span className="text-white/60">{brand.priceBand}</span>}
                {provider.code && (
                  <span className="font-mono tracking-wide text-white/60">
                    {formatCode(provider.code)}
                  </span>
                )}
              </p>
              {location && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/75">
                  <MapPinIcon className="h-4 w-4 shrink-0" />
                  {map ? (
                    <a href={map} target="_blank" rel="noreferrer" className="hover:underline">
                      {location}
                    </a>
                  ) : (
                    location
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Adaptive CTA */}
          {hasBookableServices ? (
            <Link
              href="/explore"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-forest hover:bg-gold-soft"
            >
              Book a session
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => setEnquireOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-forest hover:bg-gold-soft"
            >
              Enquire now
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {(brand?.about || brand?.openingHours || brand?.website || tags.length > 0) && (
          <div className="space-y-4 border-t border-white/10 px-7 py-5">
            {brand?.about && (
              <p className="max-w-2xl leading-relaxed text-white/80">{brand.about}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-white/60">
              {brand?.openingHours && <span>{brand.openingHours}</span>}
              {brand?.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold-soft hover:underline"
                >
                  Visit website
                </a>
              )}
              {socialEntries.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="capitalize text-gold-soft hover:underline"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Listing contact panel — how to reach a practice that doesn't book through us */}
      {isListing && (
        <section className="mt-8 rounded-3xl border border-hairline bg-surface p-7">
          <h2 className="font-display text-2xl text-forest">Get in touch</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Send {provider.businessName} an enquiry, or reach them directly.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => setEnquireOpen(true)}>Send an enquiry</Button>
            {brand?.externalBookingUrl && (
              <a
                href={brand.externalBookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-forest hover:border-leaf"
              >
                Book on their site
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            )}
            {brand?.contactPhone && (
              <a
                href={`tel:${brand.contactPhone}`}
                className="inline-flex items-center rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-forest hover:border-leaf"
              >
                Call {brand.contactPhone}
              </a>
            )}
            {brand?.contactEmail && (
              <a
                href={`mailto:${brand.contactEmail}`}
                className="inline-flex items-center rounded-full border border-hairline bg-surface px-4 py-2 text-sm font-medium text-forest hover:border-leaf"
              >
                Email
              </a>
            )}
          </div>

          {amenities.length > 0 && (
            <div className="mt-6 border-t border-hairline pt-5">
              <h3 className="text-sm font-semibold text-foreground">Amenities</h3>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-secondary">
                {amenities.map((a) => (
                  <li key={a} className="inline-flex items-center gap-1.5">
                    <CheckIcon className="h-4 w-4 text-leaf" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <Section title="Gallery">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="h-48 w-full rounded-2xl border border-hairline object-cover"
              />
            ))}
          </div>
        </Section>
      )}

      {/* Services — only when this practice sells through AyurPass */}
      {hasBookableServices && (
        <Section title="Services & sessions" count={services?.length}>
          {services === null ? (
            <SkeletonGrid />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Products */}
      {products && products.length > 0 && (
        <Section title="Products" count={products.length}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      <EnquireModal
        open={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        providerId={provider.id}
        businessName={provider.businessName}
      />
    </Shell>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-forest">
        {title}
        {typeof count === "number" && count > 0 && (
          <span className="ml-2 text-base font-normal text-ink-muted">({count})</span>
        )}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-2xl bg-clay/70" />
      ))}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper>
      <div className="mx-auto w-full max-w-6xl px-5 py-10">{children}</div>
    </LayoutWrapper>
  );
}
