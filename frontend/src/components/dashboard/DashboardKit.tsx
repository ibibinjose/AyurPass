"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** Consistent page header for all dashboard screens — mobile-first. */
export function DashHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)] sm:text-[11px]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[1.65rem] leading-tight text-forest sm:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[0.875rem] font-medium leading-relaxed text-ink-muted sm:text-[0.9375rem]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
          {action}
        </div>
      ) : null}
    </header>
  );
}

/** Elevated form / panel card. */
export function DashCard({
  title,
  description,
  children,
  className = "",
  footer,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-hairline bg-surface p-5 shadow-[0_4px_20px_rgba(36,56,46,0.04)] sm:p-6 ${className}`}
    >
      {title ? (
        <div className="mb-4">
          <h2 className="font-display text-lg text-forest sm:text-xl">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm font-medium text-ink-muted">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
      {footer ? <div className="mt-5 border-t border-hairline pt-4">{footer}</div> : null}
    </section>
  );
}

/** Section label between blocks. */
export function DashSectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">{children}</h2>
  );
}

/** Quick-link tile grid for organizer navigation. */
export function DashQuickLinks({
  items,
}: {
  items: { href: string; title: string; body: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="profile-spring rounded-2xl border border-hairline bg-surface p-4 transition-colors hover:border-leaf"
        >
          <p className="text-sm font-bold text-forest">{item.title}</p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-ink-muted">{item.body}</p>
        </Link>
      ))}
    </div>
  );
}

/** Filter tab strip. */
export function DashTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="chip-scroll flex gap-1 overflow-x-auto rounded-full border border-hairline bg-surface p-1"
      role="tablist"
    >
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors ${
              active ? "bg-forest text-white" : "text-ink-secondary hover:text-forest"
            }`}
          >
            {t.label}
            {t.count !== undefined ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? "bg-white/20" : "bg-clay text-ink-muted"
                }`}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** List skeleton rows. */
export function DashListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[4.5rem] animate-pulse rounded-2xl bg-clay/70" />
      ))}
    </div>
  );
}

/** Form action row. */
export function DashFormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 pt-1">{children}</div>;
}

/** Sticky bottom save bar when a form has unsaved changes. */
export function DashStickySave({
  dirty,
  busy,
  onSave,
  onDiscard,
  formId,
  label = "Save changes",
  message = "You have unsaved changes",
}: {
  dirty: boolean;
  busy?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  formId?: string;
  label?: string;
  message?: string;
}) {
  if (!dirty) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-4">
      <div className="pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-hairline bg-surface/95 px-4 py-3 shadow-[0_12px_40px_rgba(36,56,46,0.16)] backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-forest">{message}</p>
          <p className="truncate text-xs font-medium text-ink-muted">Review and save when ready.</p>
        </div>
        {onDiscard ? (
          <button
            type="button"
            onClick={onDiscard}
            disabled={busy}
            className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-ink-secondary hover:text-forest disabled:opacity-50"
          >
            Discard
          </button>
        ) : null}
        <button
          type={formId ? "submit" : "button"}
          form={formId}
          onClick={formId ? undefined : onSave}
          disabled={busy}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-deep disabled:opacity-50"
        >
          {busy ? "Saving…" : label}
        </button>
      </div>
    </div>
  );
}

/** Section completeness chip for side nav. */
export function DashNavDot({ done }: { done: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
        done ? "bg-leaf" : "bg-ink-muted/35"
      }`}
      aria-hidden
    />
  );
}
