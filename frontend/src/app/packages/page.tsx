"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { WellnessPackage } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { PackageCard } from "@/components/PackageCard";
import { EmptyState } from "@/components/ui";

export default function PackagesPage() {
  const [packages, setPackages] = useState<WellnessPackage[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .packages()
      .then(setPackages)
      .catch(() => setError(true));
  }, []);

  return (
    <LayoutWrapper>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <h1 className="font-display text-3xl text-forest sm:text-4xl">Wellness packages</h1>
        <p className="mt-2 max-w-xl text-ink-secondary">
          Curated programs from verified clinics, studios and spas across the AyurPass network.
        </p>

        <div className="mt-10">
          {error ? (
            <EmptyState
              title="We couldn't load packages"
              body="The wellness network is unreachable right now. Please try again shortly."
            />
          ) : packages === null ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-clay/70" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <EmptyState
              title="The collection is being curated"
              body="Providers are crafting their first packages. If you run a practice, be among the first to list yours."
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
                        href="/register"
                        className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-forest hover:border-leaf"
                      >
                        Enquire
                      </Link>
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </LayoutWrapper>
  );
}
