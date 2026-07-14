import Link from "next/link";
import { formatMoney } from "@/lib/api";
import { CATEGORY_LABEL, CATEGORY_TAG_CLASS, formatDuration, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Service } from "@/lib/types";

export function ServiceCard({ service, actions }: { service: Service; actions?: React.ReactNode }) {
  const practitioner = service.professional?.user?.fullName;
  return (
    <article className="flex flex-col rounded-2xl border border-hairline bg-surface p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(36,56,46,0.08)]">
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
      </div>

      <h3 className="mt-3 font-display text-lg text-forest">{service.name}</h3>
      {service.provider && (
        <p className="mt-0.5 text-xs text-ink-muted">
          {service.provider.businessName} ·{" "}
          {PROVIDER_TYPE_LABEL[service.provider.type] ?? service.provider.type}
        </p>
      )}
      {practitioner && (
        <p className="mt-1 text-xs text-ink-secondary">
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
          <p className="text-lg font-semibold text-foreground">{formatMoney(service.price, service.currency)}</p>
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
    </article>
  );
}
