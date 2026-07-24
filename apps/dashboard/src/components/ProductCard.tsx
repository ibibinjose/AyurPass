"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/api";
import { formatCode, PROVIDER_TYPE_LABEL } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { BrandMark } from "./BrandMark";
import { QualityCardStrip } from "./QualityControls";
import { ArrowRightIcon, LotusIcon } from "./icons";
import { useDirectoryDensity } from "@/components/DirectoryLayout";
import { CardListMedia } from "@/components/CardListMedia";

export function ProductCard({
  product,
  actions,
}: {
  product: Product;
  actions?: React.ReactNode;
}) {
  const density = useDirectoryDensity();
  const isList = density === "list";

  const soldOut = product.inventoryQuantity != null && product.inventoryQuantity <= 0;
  const lowStock =
    !soldOut &&
    product.inventoryQuantity != null &&
    product.inventoryQuantity > 0 &&
    product.inventoryQuantity <= 5;
  const image = product.images?.find(Boolean) ?? null;
  const description = product.description?.replace(/\s+/g, " ").trim();
  const verified = product.provider?.verificationStatus === "verified";
  const priceLabel = formatMoney(product.price);

  const buy =
    actions ??
    (soldOut ? (
      <span className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[var(--separator)] px-4 py-2 text-sm font-semibold text-ink-muted">
        Sold out
      </span>
    ) : (
      <Link
        href={`/shop/${product.id}`}
        className="profile-spring inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(36,56,46,0.18)] hover:bg-forest-deep"
      >
        Buy
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    ));

  if (isList) {
    return (
      <article className="card-surface card-list-row group">
        <CardListMedia
          src={image}
          alt=""
          fallback={<LotusIcon className="h-8 w-8 text-gold-soft/90" />}
          badge={
            soldOut ? (
              <span className="rounded-full bg-ink-muted/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Sold out
              </span>
            ) : null
          }
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {(product.category || product.code) ? (
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  {product.category ? (
                    <span className="rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
                      {product.category}
                    </span>
                  ) : null}
                  {product.code ? (
                    <span className="font-mono text-[10px] font-bold text-ink-muted">
                      {formatCode(product.code)}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <h3 className="line-clamp-1 font-display text-base font-semibold text-forest sm:text-lg">
                {product.name}
              </h3>
              {product.provider ? (
                <p className="mt-0.5 truncate text-sm font-medium text-ink-secondary">
                  {product.provider.businessName}
                  {verified ? " · Verified" : ""}
                </p>
              ) : null}
              {description ? (
                <p className="mt-1 line-clamp-1 text-xs font-medium text-ink-muted sm:line-clamp-2">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-lg font-semibold tabular-nums text-forest">
                {priceLabel}
              </p>
              {product.inventoryQuantity != null && !soldOut ? (
                <p className="text-[10px] font-semibold text-ink-muted">
                  {product.inventoryQuantity} in stock
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <QualityCardStrip dense target={{ type: "product", id: product.id }} />
            <span className="ml-auto">{buy}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card-surface group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-clay">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
              soldOut ? "opacity-70 grayscale-[0.3]" : ""
            }`}
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--color-forest),var(--color-leaf))]"
          >
            <LotusIcon className="h-12 w-12 text-gold-soft/90" />
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-ink-muted/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
              Sold out
            </span>
          ) : lowStock ? (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-forest-deep shadow-sm">
              Only {product.inventoryQuantity} left
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {product.category ? (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-forest">
              {product.category}
            </span>
          ) : null}
          {product.code ? (
            <span className="inline-flex items-center rounded-full border border-dashed border-hairline bg-clay/40 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-ink-muted">
              {formatCode(product.code)}
            </span>
          ) : null}
        </div>
        <h3 className="type-title text-[1.125rem] leading-snug sm:text-xl">{product.name}</h3>

        {product.provider ? (
          <div className="mt-2.5 flex items-center gap-2.5">
            <BrandMark provider={product.provider} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-forest">
                {product.provider.businessName}
              </p>
              <p className="truncate text-xs font-medium text-ink-muted">
                {PROVIDER_TYPE_LABEL[product.provider.type] ?? product.provider.type}
                {verified ? " · Verified" : ""}
              </p>
            </div>
          </div>
        ) : null}

        {description ? (
          <p className="mt-2.5 line-clamp-2 text-sm font-medium leading-relaxed text-ink-secondary">
            {description}
          </p>
        ) : null}

        <QualityCardStrip dense target={{ type: "product", id: product.id }} />

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--separator)] pt-4">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold tabular-nums text-forest sm:text-xl">
              {priceLabel}
            </p>
            {product.inventoryQuantity != null && !soldOut ? (
              <p className="text-sm font-medium text-ink-muted">
                {product.inventoryQuantity} in stock
              </p>
            ) : soldOut ? (
              <p className="text-sm font-medium text-ink-muted">Currently unavailable</p>
            ) : null}
          </div>
          {buy}
        </div>
      </div>
    </article>
  );
}
