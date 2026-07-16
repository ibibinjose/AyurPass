"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { WellnessPackage } from "@/lib/types";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PackageCard } from "@/components/PackageCard";
import { Button, CardSkeletonGrid, EmptyState, PageHeader } from "@/components/ui";

export default function PackagesPage() {
  const [packages, setPackages] = useState<WellnessPackage[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setPackages(null);
    api
      .packages()
      .then(setPackages)
      .catch(() => {
        setError(true);
        setPackages([]);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <LayoutWrapper>
      <div className="page-shell flex-1">
        <PageHeader
          title="Wellness packages"
          description="Curated programs from verified clinics, studios and spas across the AyurPass network."
        />

        <div className="mt-10">
          {error ? (
            <EmptyState
              title="We couldn't load packages"
              body="The wellness network is unreachable right now. Please try again shortly."
              action={
                <Button type="button" variant="ghost" onClick={load}>
                  Try again
                </Button>
              }
            />
          ) : packages === null ? (
            <CardSkeletonGrid count={6} />
          ) : packages.length === 0 ? (
            <EmptyState
              title="The collection is being curated"
              body="Providers are crafting their first packages. If you run a practice, be among the first to list yours."
              action={
                <Link
                  href="/list-your-business"
                  className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-deep"
                >
                  List your practice
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  actions={
                    pkg.serviceId ? (
                      <Link
                        href={`/book/${pkg.serviceId}`}
                        className="rounded-full bg-forest px-5 py-2 text-sm font-medium text-white hover:bg-forest-deep"
                      >
                        Book
                      </Link>
                    ) : (
                      <Link
                        href="/discover"
                        className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-forest hover:border-leaf"
                      >
                        Find practice
                      </Link>
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
