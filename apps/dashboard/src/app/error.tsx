"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Send to Sentry / observability once provisioned.
    console.error("[AyurPass Error]", error);
  }, [error]);

  return (
    <LayoutWrapper>
      <main className="flex flex-1 items-center justify-center px-[var(--space-page-x)] py-20">
        <div className="mx-auto max-w-md text-center">
          {/* Decorative warning dot */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--fill-tertiary)]">
            <svg
              className="h-10 w-10 text-[var(--system-red)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1 className="font-[family-name:var(--font-fraunces)] text-[var(--text-3xl)] font-semibold leading-[var(--leading-tight)] text-forest">
            Something went wrong
          </h1>
          <p className="mt-3 text-[var(--text-base)] leading-[var(--leading-body)] text-ink-muted">
            An unexpected error occurred. Please try again — if the problem
            persists, contact us at{" "}
            <a
              href="mailto:hello@ayurpass.com"
              className="font-medium text-forest underline underline-offset-2"
            >
              hello@ayurpass.com
            </a>
            .
          </p>

          {error.digest && (
            <p className="mt-2 text-[var(--text-xs)] text-ink-muted/60">
              Error reference: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="inline-flex min-h-[var(--tap-min)] cursor-pointer items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-deep"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex min-h-[var(--tap-min)] items-center gap-2 rounded-full border border-hairline bg-surface px-6 py-2.5 text-sm font-semibold text-forest hover:border-leaf"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>
    </LayoutWrapper>
  );
}
