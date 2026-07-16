import Link from "next/link";
import { formatMoney } from "@/lib/api";
import {
  CATEGORY_LABEL,
  CATEGORY_TAG_CLASS,
  formatCode,
  formatDuration,
  PROVIDER_TYPE_LABEL,
} from "@/lib/catalog";
import type { Service } from "@/lib/types";
import { BrandMark } from "./BrandMark";

export function ServiceCard({ service, actions }: { service: Service; actions?: React.ReactNode }) {
  const practitioner = service.professional?.user?.fullName;
  const image = service.imageUrl;
  return (
    <article className="card-surface flex flex-col overflow-hidden">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={service.name} className="h-36 w-full object-cover" loading="lazy" />
      )}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${CATEGORY_TAG_CLASS[service.category]}`}
          >
            {CATEGORY_LABEL[service.category]}
          </span>
          {service.isVirtual ? (
            <span className="rounded-full border border-hairline px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-secondary">
              Virtual
            </span>
          ) : null}
          {service.code ? (
            <span className="ml-auto font-mono text-[11px] font-medium tracking-wide text-ink-muted">
              {formatCode(service.code)}
            </span>
          ) : null}
        </div>

        <h3 className="type-title mt-3 text-[1.125rem] sm:text-xl">{service.name}</h3>

        {service.provider && (
          <div className="mt-2.5 flex items-center gap-2">
            <BrandMark provider={service.provider} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-forest">
                {service.provider.businessName}
              </p>
              <p className="truncate text-[11px] text-ink-muted">
                {PROVIDER_TYPE_LABEL[service.provider.type] ?? service.provider.type}
              </p>
            </div>
          </div>
        )}
        {practitioner ? (
          <p className="mt-1.5 text-sm font-medium text-ink-secondary">
            with <span className="font-semibold text-foreground">{practitioner}</span>
            {service.professional?.title ? `, ${service.professional.title}` : ""}
          </p>
        ) : null}

        {service.description ? (
          <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-ink-secondary">
            {service.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4 sm:pt-5">
          <div>
            <p className="text-lg font-bold tabular-nums text-foreground sm:text-xl">
              {formatMoney(service.price, service.currency)}
            </p>
            <p className="text-sm font-medium text-ink-muted">{formatDuration(service.durationMinutes)}</p>
          </div>
          {actions ?? (
            <Link
              href={`/book/${service.id}`}
              className="inline-flex min-h-11 items-center rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep"
            >
              Book
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
