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
    <article className="card-surface flex flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {product.category ? (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">
              {product.category}
            </span>
          ) : null}
          {soldOut ? (
            <span className="rounded-full border border-hairline px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              Sold out
            </span>
          ) : null}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay text-forest">
          <LotusIcon className="h-4.5 w-4.5" />
        </span>
      </div>

      <h3 className="type-title mt-3 text-[1.125rem] sm:text-xl">{product.name}</h3>
      {product.provider ? (
        <p className="mt-1 text-sm font-medium text-ink-muted">
          {product.provider.businessName} ·{" "}
          {PROVIDER_TYPE_LABEL[product.provider.type] ?? product.provider.type}
        </p>
      ) : null}
      {product.description ? (
        <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-ink-secondary">
          {product.description}
        </p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 sm:pt-5">
        <div>
          <p className="text-lg font-bold tabular-nums text-foreground sm:text-xl">
            {formatMoney(product.price)}
          </p>
          {product.inventoryQuantity != null && !soldOut ? (
            <p className="text-sm font-medium text-ink-muted">{product.inventoryQuantity} in stock</p>
          ) : null}
        </div>
        {actions ??
          (soldOut ? (
            <span className="inline-flex min-h-11 items-center rounded-full border border-hairline px-5 py-2 text-sm font-semibold text-ink-muted">
              Sold out
            </span>
          ) : (
            <Link
              href={`/shop/${product.id}`}
              className="inline-flex min-h-11 items-center rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep"
            >
              Buy
            </Link>
          ))}
      </div>
    </article>
  );
}
