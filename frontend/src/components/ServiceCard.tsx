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
    <article className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface transition-shadow hover:shadow-[0_8px_30px_rgba(36,56,46,0.08)]">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-36 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${CATEGORY_TAG_CLASS[service.category]}`}
          >
            {CATEGORY_LABEL[service.category]}
          </span>
          {service.isVirtual && (
            <span className="rounded-full border border-hairline px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
              Virtual
            </span>
          )}
          {service.code && (
            <span className="ml-auto font-mono text-[11px] tracking-wide text-ink-muted">
              {formatCode(service.code)}
            </span>
          )}
        </div>

        <h3 className="mt-3 font-display text-lg text-forest">{service.name}</h3>

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
        {practitioner && (
          <p className="mt-1.5 text-xs text-ink-secondary">
            with {practitioner}
            {service.professional?.title ? `, ${service.professional.title}` : ""}
          </p>
        )}

        {service.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
            {service.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-5">
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatMoney(service.price, service.currency)}
            </p>
            <p className="text-xs text-ink-muted">{formatDuration(service.durationMinutes)}</p>
          </div>
          {actions ?? (
            <Link
              href={`/book/${service.id}`}
              className="rounded-full bg-forest px-5 py-2 text-sm font-medium text-white hover:bg-forest-deep"
            >
              Book
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
