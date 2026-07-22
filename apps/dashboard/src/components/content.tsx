/** Shared building blocks for marketing, support and legal content pages. */
import type { ReactNode } from "react";
import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-hairline bg-gradient-to-br from-forest to-leaf">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,rgba(233,217,184,0.18),transparent),radial-gradient(50rem_28rem_at_-10%_110%,rgba(255,255,255,0.1),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-[var(--space-page-x)] py-14 sm:py-20">
        {eyebrow ? (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-soft" aria-hidden />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-white/80 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
        {actions ? <div className="mt-6 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

/** A block within a legal/policy document. A `string[]` entry renders as a bullet list. */
export interface DocSection {
  id: string;
  heading: string;
  /** Optional short blurb under the heading */
  summary?: string;
  blocks: (string | string[])[];
}

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/accessibility", label: "Accessibility" },
] as const;

export function LegalDoc({
  updated,
  effective,
  sections,
  contactEmail,
  contactLabel,
}: {
  updated: string;
  /** Optional “effective from” line */
  effective?: string;
  sections: DocSection[];
  contactEmail?: string;
  contactLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-[var(--space-page-x)] py-10 sm:py-14">
      {/* Meta + legal nav */}
      <div className="flex flex-col gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink-muted">
            Last updated: <time dateTime={updated}>{updated}</time>
            {effective ? (
              <>
                {" · "}
                Effective: <time dateTime={effective}>{effective}</time>
              </>
            ) : null}
          </p>
          <p className="mt-1 max-w-xl text-xs font-medium leading-relaxed text-ink-muted">
            This page is part of AyurPass’s legal commitments. Related policies are linked below.
          </p>
        </div>
        <nav aria-label="Legal policies" className="flex flex-wrap gap-1.5">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-ink-secondary transition-colors hover:border-leaf hover:text-forest"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        {/* Sticky TOC */}
        <nav
          aria-label="On this page"
          className="lg:sticky lg:top-24"
        >
          <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-[0_2px_12px_rgba(36,56,46,0.04)] sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              On this page
            </p>
            <ol className="mt-3 space-y-1">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="group flex gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-clay/50 hover:text-forest"
                  >
                    <span className="tabular-nums text-gold group-hover:text-forest">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-snug">{s.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Body */}
        <article className="min-w-0">
          <div className="space-y-10 sm:space-y-12">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-28 rounded-2xl border border-hairline/80 bg-surface/60 p-5 sm:p-7"
              >
                <h2 className="font-display text-xl font-semibold text-forest sm:text-2xl">
                  <span className="mr-2 text-gold" aria-hidden>
                    {i + 1}.
                  </span>
                  {s.heading}
                </h2>
                {s.summary ? (
                  <p className="mt-2 text-sm font-medium leading-relaxed text-ink-muted">
                    {s.summary}
                  </p>
                ) : null}
                <div className="mt-4 space-y-3.5">
                  {s.blocks.map((block, bi) =>
                    Array.isArray(block) ? (
                      <ul key={bi} className="space-y-2.5">
                        {block.map((li) => (
                          <li key={li} className="flex gap-3 text-sm text-ink-secondary sm:text-[0.9375rem]">
                            <span
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf"
                              aria-hidden
                            />
                            <span className="leading-relaxed font-medium">{li}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        key={bi}
                        className="text-sm font-medium leading-relaxed text-ink-secondary sm:text-[0.9375rem] sm:leading-[1.7]"
                      >
                        {block}
                      </p>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-10 rounded-2xl border border-hairline bg-clay/30 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
            <div>
              <p className="font-display text-lg font-semibold text-forest">Questions?</p>
              <p className="mt-1 text-sm font-medium text-ink-secondary">
                {contactLabel ??
                  "We aim to respond to verified privacy and legal requests within 30 days."}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
              {contactEmail ? (
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-deep"
                >
                  {contactEmail}
                </a>
              ) : null}
              <Link
                href="/contact"
                className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest hover:border-leaf"
              >
                Contact us
              </Link>
              <Link
                href="/help"
                className="inline-flex min-h-10 items-center rounded-full border border-hairline bg-surface px-4 text-sm font-semibold text-forest hover:border-leaf"
              >
                Help centre
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export function ContentCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-hairline bg-surface p-6 shadow-[0_2px_12px_rgba(36,56,46,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}
