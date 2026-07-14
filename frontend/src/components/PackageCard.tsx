import { formatMoney } from "@/lib/api";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { WellnessPackage } from "@/lib/types";
import { LeafIcon } from "./icons";

export function PackageCard({
  pkg,
  actions,
}: {
  pkg: WellnessPackage;
  actions?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-hairline bg-surface p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(36,56,46,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-forest">{pkg.name}</h3>
          {pkg.provider && (
            <p className="mt-0.5 text-xs text-ink-muted">
              {pkg.provider.businessName} · {PROVIDER_TYPE_LABEL[pkg.provider.type] ?? pkg.provider.type}
            </p>
          )}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay text-forest">
          <LeafIcon className="h-4.5 w-4.5" />
        </span>
      </div>

      {pkg.description && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-secondary">
          {pkg.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
        {pkg.durationDays != null && (
          <span className="rounded-full border border-hairline px-2.5 py-1">
            {pkg.durationDays} {pkg.durationDays === 1 ? "day" : "days"}
          </span>
        )}
        {pkg.isRecurring && (
          <span className="rounded-full border border-hairline px-2.5 py-1">Recurring</span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-5">
        <p className="text-xl font-semibold text-foreground">{formatMoney(pkg.totalPrice)}</p>
        {actions}
      </div>
    </article>
  );
}
