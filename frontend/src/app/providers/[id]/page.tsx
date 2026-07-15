"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatAddress, formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Product, Provider, Service } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { ProductCard } from "@/components/ProductCard";
import { BrandMark } from "@/components/BrandMark";
import { ArrowRightIcon, MapPinIcon, ShieldIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui";

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null | undefined>(undefined);
  const [services, setServices] = useState<Service[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

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
                {provider.code && (
                  <span className="font-mono tracking-wide text-white/60">
                    {formatCode(provider.code)}
                  </span>
                )}
              </p>
              {location && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/75">
                  <MapPinIcon className="h-4 w-4 shrink-0" />
                  {location}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/explore"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-forest hover:bg-gold-soft"
          >
            Book a session
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {(brand?.about || brand?.openingHours || brand?.website) && (
          <div className="border-t border-white/10 px-7 py-5">
            {brand?.about && (
              <p className="max-w-2xl leading-relaxed text-white/80">{brand.about}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-white/60">
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
            </div>
          </div>
        )}
      </section>

      {/* Services */}
      <Section title="Services & sessions" count={services?.length}>
        {services === null ? (
          <SkeletonGrid />
        ) : services.length === 0 ? (
          <EmptyState title="No sessions listed yet" body="This practice hasn't published bookable sessions." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </Section>

      {/* Products */}
      {(products === null || products.length > 0) && (
        <Section title="Products" count={products?.length}>
          {products === null ? (
            <SkeletonGrid />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Section>
      )}
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
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
      <Footer />
    </>
  );
}
