"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { api, formatMoney } from "@/lib/api";
import type { JobListing } from "@/lib/types";
import { EmptyState, InlineSpinner } from "@/components/ui";
import { ArrowRightIcon, CompassIcon } from "@/components/icons";
import { loginUrl } from "@/lib/auth-redirect";
import { useAuth } from "@/context/AuthContext";

/**
 * Public careers board — job seekers browse open roles across all categories.
 * Practice owners post roles from Dashboard → Jobs & Hiring.
 */
export default function CareersPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setError(null);
    });
    api
      .jobs(q.trim() ? { q: q.trim() } : undefined)
      .then((list) => {
        if (active) setJobs(Array.isArray(list) ? list : []);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Could not load roles.");
      });
    return () => {
      active = false;
    };
  }, [q]);

  return (
    <LayoutWrapper>
      <main className="mx-auto max-w-4xl px-[var(--space-page-x)] py-10 sm:py-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">Careers</p>
        <h1 className="mt-1 font-display text-3xl text-forest sm:text-4xl">
          Work in wellness
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-ink-secondary sm:text-base">
          Open roles across Ayurveda, Yoga, spa and health clubs. Apply as a job seeker — practices
          manage listings from their Practice hub.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, city, discipline…"
            className="min-h-11 min-w-[16rem] flex-1 rounded-full border border-hairline bg-surface px-4 text-sm font-medium text-foreground placeholder:text-ink-muted focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/20"
          />
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline px-5 text-sm font-semibold text-forest hover:border-leaf"
            >
              Back to dashboard
            </Link>
          ) : (
            <Link
              href={loginUrl("/careers")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
            >
              Sign in to apply
            </Link>
          )}
        </div>

        <div className="mt-8">
          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : jobs === null ? (
            <div className="flex justify-center py-16">
              <InlineSpinner label="Loading open roles…" />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No open roles yet"
              body="Check back soon — practices post vacancies for therapists, reception and managers."
              action={
                <Link
                  href="/discover"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-white"
                >
                  <CompassIcon className="h-4 w-4" />
                  Browse practices
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className="rounded-2xl border border-hairline bg-surface px-5 py-4 shadow-[0_2px_12px_rgba(36,56,46,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold text-forest">{job.title}</p>
                      <p className="mt-0.5 text-sm font-medium text-ink-secondary">
                        {job.provider?.businessName ?? "Practice"}
                        {job.city ? ` · ${job.city}` : ""}
                        {job.country ? `, ${job.country}` : ""}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        {job.category?.replace(/_/g, " ")}
                        {job.employmentType ? ` · ${job.employmentType.replace(/_/g, " ")}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      {job.salaryMin != null || job.salaryMax != null ? (
                        <p className="text-sm font-bold text-foreground">
                          {job.salaryMin != null
                            ? formatMoney(job.salaryMin, job.currency || "AUD")
                            : ""}
                          {job.salaryMin != null && job.salaryMax != null ? " – " : ""}
                          {job.salaryMax != null
                            ? formatMoney(job.salaryMax, job.currency || "AUD")
                            : ""}
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-ink-muted">Salary on request</p>
                      )}
                      <Link
                        href={user ? `/careers?apply=${job.id}` : loginUrl(`/careers?apply=${job.id}`)}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-forest hover:underline"
                      >
                        View / apply
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                  {job.description ? (
                    <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-ink-secondary">
                      {job.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </LayoutWrapper>
  );
}
