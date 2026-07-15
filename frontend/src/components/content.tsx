/** Shared building blocks for marketing, support and legal content pages. */
import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-hairline bg-gradient-to-br from-forest to-leaf">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,rgba(233,217,184,0.18),transparent),radial-gradient(50rem_28rem_at_-10%_110%,rgba(255,255,255,0.1),transparent)]"
      />
      <div className="relative mx-auto max-w-4xl px-5 py-16 sm:py-20">
        {eyebrow ? (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-soft" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-4xl leading-[1.1] text-white sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-4 max-w-2xl text-lg text-white/80">{subtitle}</p> : null}
      </div>
    </section>
  );
}

/** A block within a legal/policy document. A `string[]` entry renders as a bullet list. */
export interface DocSection {
  id: string;
  heading: string;
  blocks: (string | string[])[];
}

export function LegalDoc({ updated, sections }: { updated: string; sections: DocSection[] }) {
  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <p className="text-sm text-ink-muted">Last updated: {updated}</p>

      <nav aria-label="On this page" className="mt-6 rounded-2xl border border-hairline bg-surface p-5">
        <p className="text-sm font-medium text-forest">On this page</p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm text-ink-secondary transition-colors hover:text-forest"
              >
                {i + 1}. {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map((s, i) => (
          <div key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="font-display text-2xl text-forest">
              <span className="text-gold">{i + 1}.</span> {s.heading}
            </h2>
            <div className="mt-3 space-y-3">
              {s.blocks.map((block, bi) =>
                Array.isArray(block) ? (
                  <ul key={bi} className="space-y-2">
                    {block.map((li) => (
                      <li key={li} className="flex gap-2.5 text-ink-secondary">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                        <span className="leading-relaxed">{li}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={bi} className="leading-relaxed text-ink-secondary">
                    {block}
                  </p>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
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
    <div className={`rounded-2xl border border-hairline bg-surface p-6 ${className}`}>{children}</div>
  );
}
