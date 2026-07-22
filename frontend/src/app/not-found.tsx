import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { CompassIcon, LeafIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <LayoutWrapper>
      <main className="flex flex-1 items-center justify-center px-[var(--space-page-x)] py-20">
        <div className="mx-auto max-w-md text-center">
          {/* Decorative leaf */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold-soft/40">
            <LeafIcon className="h-10 w-10 text-leaf" />
          </div>

          <h1 className="font-[family-name:var(--font-fraunces)] text-[var(--text-3xl)] font-semibold leading-[var(--leading-tight)] text-forest">
            Page not found
          </h1>
          <p className="mt-3 text-[var(--text-base)] leading-[var(--leading-body)] text-ink-muted">
            The path you're looking for doesn't exist — it may have been moved or
            the URL might be incorrect.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex min-h-[var(--tap-min)] items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-deep"
            >
              Go home
            </Link>
            <Link
              href="/discover"
              className="inline-flex min-h-[var(--tap-min)] items-center gap-2 rounded-full border border-hairline bg-surface px-6 py-2.5 text-sm font-semibold text-forest hover:border-leaf"
            >
              <CompassIcon className="h-4 w-4" />
              Discover practices
            </Link>
          </div>
        </div>
      </main>
    </LayoutWrapper>
  );
}
