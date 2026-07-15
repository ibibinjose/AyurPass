import Link from "next/link";
import { formatAddress, formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Provider } from "@/lib/types";
import { BrandMark } from "./BrandMark";
import { ArrowRightIcon, MapPinIcon, ShieldIcon } from "./icons";

function countLabel(n: number, singular: string) {
  return `${n} ${n === 1 ? singular : `${singular}s`}`;
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const location = formatAddress(provider.address);
  const verified = provider.verificationStatus === "verified";
  const cover = provider.brandProfile?.coverImageUrl;
  const counts = provider._count;
  const stats = counts
    ? [
        counts.services ? countLabel(counts.services, "service") : null,
        counts.products ? countLabel(counts.products, "product") : null,
        counts.professionals ? countLabel(counts.professionals, "practitioner") : null,
      ].filter(Boolean)
    : [];

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface transition-shadow hover:shadow-[0_8px_30px_rgba(36,56,46,0.08)]"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-24 w-full object-cover" />
      ) : (
        <div aria-hidden className="h-24 w-full bg-[linear-gradient(120deg,var(--color-forest),var(--color-leaf))]" />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="-mt-11 flex items-end justify-between">
          <BrandMark provider={provider} size="lg" className="ring-2 ring-surface" />
          {verified && (
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
              <ShieldIcon className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        <h3 className="mt-4 font-display text-lg text-forest">{provider.businessName}</h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
          <span>{PROVIDER_TYPE_LABEL[provider.type] ?? provider.type}</span>
          {provider.code && (
            <span className="font-mono tracking-wide text-ink-secondary">{formatCode(provider.code)}</span>
          )}
        </p>

        {location && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-secondary">
            <MapPinIcon className="h-4 w-4 shrink-0 text-leaf" />
            {location}
          </p>
        )}

        {stats.length > 0 && <p className="mt-3 text-xs text-ink-muted">{stats.join(" · ")}</p>}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-forest group-hover:gap-2.5">
          View practice
          <ArrowRightIcon className="h-4 w-4 transition-all" />
        </span>
      </div>
    </Link>
  );
}
