import Link from "next/link";
import { formatMoney } from "@/lib/api";
import { PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { LotusIcon } from "./icons";

export function ProductCard({
  product,
  actions,
}: {
  product: Product;
  actions?: React.ReactNode;
}) {
  const soldOut = product.inventoryQuantity != null && product.inventoryQuantity <= 0;
  return (
    <article className="flex flex-col rounded-2xl border border-hairline bg-surface p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(36,56,46,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {product.category && (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
              {product.category}
            </span>
          )}
          {soldOut && (
            <span className="rounded-full border border-hairline px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Sold out
            </span>
          )}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay text-forest">
          <LotusIcon className="h-4.5 w-4.5" />
        </span>
      </div>

      <h3 className="mt-3 font-display text-lg text-forest">{product.name}</h3>
      {product.provider && (
        <p className="mt-0.5 text-xs text-ink-muted">
          {product.provider.businessName} ·{" "}
          {PROVIDER_TYPE_LABEL[product.provider.type] ?? product.provider.type}
        </p>
      )}
      {product.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
          {product.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-5">
        <div>
          <p className="text-lg font-semibold text-foreground">{formatMoney(product.price)}</p>
          {product.inventoryQuantity != null && !soldOut && (
            <p className="text-xs text-ink-muted">{product.inventoryQuantity} in stock</p>
          )}
        </div>
        {actions ??
          (soldOut ? (
            <span className="rounded-full border border-hairline px-5 py-2 text-sm font-medium text-ink-muted">
              Sold out
            </span>
          ) : (
            <Link
              href={`/shop/${product.id}`}
              className="rounded-full bg-forest px-5 py-2 text-sm font-medium text-white hover:bg-forest-deep"
            >
              Buy
            </Link>
          ))}
      </div>
    </article>
  );
}
