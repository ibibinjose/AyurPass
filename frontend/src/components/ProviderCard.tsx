import Link from "next/link";
import { formatAddress, formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import { practicePath } from "@/lib/paths";
import type { Provider } from "@/lib/types";
import { BrandMark } from "./BrandMark";
import { VerifiedTick } from "./VerifiedTick";
import { AuthorityBadgeRow } from "./AuthorityBadge";
import { authoritiesForProvider } from "@/lib/credentials";
import { ArrowRightIcon, MapPinIcon } from "./icons";

function countLabel(n: number, singular: string) {
  return `${n} ${n === 1 ? singular : `${singular}s`}`;
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const location = formatAddress(provider.address);
  const verified = provider.verificationStatus === "verified";
  const authorities = authoritiesForProvider(provider);
  const brand = provider.brandProfile;
  const cover = brand?.coverImageUrl;
  const counts = provider._count;
  const bookable = (counts?.services ?? 0) > 0;
  // Directory-only practices show discovery tags instead of catalogue counts.
  const isListing = provider.listingTier === "FREE_LISTING" || !bookable;
  const tags = (brand?.tags ?? []).filter(Boolean).slice(0, 3);
  const stats = counts
    ? [
        counts.services ? countLabel(counts.services, "service") : null,
        counts.products ? countLabel(counts.products, "product") : null,
        counts.professionals ? countLabel(counts.professionals, "practitioner") : null,
      ].filter(Boolean)
    : [];

  return (
    <Link
      href={practicePath(provider)}
      className="card-surface group flex flex-col overflow-hidden"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={`${provider.businessName} cover`}
          className="h-24 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div aria-hidden className="h-24 w-full bg-[linear-gradient(120deg,var(--color-forest),var(--color-leaf))]" />
      )}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="-mt-10 flex items-end justify-between gap-2 sm:-mt-11">
          <BrandMark provider={provider} size="lg" className="ring-2 ring-surface" />
          {isListing ? (
            <span className="type-label mb-1 rounded-full bg-clay px-2.5 py-1 text-ink-secondary">
              Listing
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex min-w-0 items-center gap-1.5 sm:mt-4">
          <h3 className="type-title min-w-0 truncate text-[1.125rem] sm:text-xl">
            {provider.businessName}
          </h3>
          {verified ? <VerifiedTick size="md" /> : null}
        </div>
        {authorities.length > 0 ? (
          <div className="mt-2">
            <AuthorityBadgeRow authorities={authorities} size="sm" />
          </div>
        ) : null}
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm font-medium text-ink-secondary">
          <span>{PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}</span>
          {brand?.priceBand ? <span className="font-semibold text-foreground">{brand.priceBand}</span> : null}
          {provider.code ? (
            <span className="font-mono text-xs tracking-wide text-ink-muted">{formatCode(provider.code)}</span>
          ) : null}
        </p>
        {(provider.registrationNumber || provider.licenceNumber) && (
          <p className="mt-1.5 text-xs font-medium text-ink-muted">
            {provider.registrationNumber ? `Reg ${provider.registrationNumber}` : null}
            {provider.registrationNumber && provider.licenceNumber ? " · " : null}
            {provider.licenceNumber ? `Lic ${provider.licenceNumber}` : null}
          </p>
        )}

        {location ? (
          <p className="mt-2.5 inline-flex items-start gap-1.5 text-sm font-medium leading-snug text-ink-secondary">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
            <span>{location}</span>
          </p>
        ) : null}

        {isListing
          ? tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-clay px-2.5 py-1 text-xs font-semibold text-ink-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )
          : stats.length > 0 && (
              <p className="mt-3 text-sm font-medium text-ink-muted">{stats.join(" · ")}</p>
            )}

        <span className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-semibold text-forest group-hover:gap-2.5 sm:pt-5">
          {isListing ? "View listing" : "View practice"}
          <ArrowRightIcon className="h-4 w-4 transition-all" />
        </span>
      </div>
    </Link>
  );
}
