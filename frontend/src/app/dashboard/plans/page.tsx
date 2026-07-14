"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { TreatmentPlan } from "@/lib/types";
import { SparkleIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui";

export default function TreatmentPlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<TreatmentPlan[] | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .plansByConsumer(user.id)
      .then(setPlans)
      .catch(() => setPlans([]));
  }, [user]);

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Treatment plans</h1>
      <p className="mt-1 text-ink-muted">
        Structured programs designed for you by your practitioners.
      </p>

      <div className="mt-8">
        {plans === null ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            title="No treatment plans yet"
            body="After a consultation, your practitioner can design a personalised program — phases, therapies and lifestyle guidance will live here."
          />
        ) : (
          <ul className="space-y-3">
            {plans.map((p) => (
              <li key={p.id} className="rounded-2xl border border-hairline bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      {p.aiGenerated && <SparkleIcon className="h-4 w-4 text-gold" />}
                      {p.name ?? "Personalised plan"}
                    </p>
                    {p.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                        {p.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      p.status === "active" ? "bg-forest text-white" : "bg-clay text-ink-secondary"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                {(p.startDate || p.endDate) && (
                  <p className="mt-3 text-xs text-ink-muted">
                    {p.startDate && new Date(p.startDate).toLocaleDateString()}
                    {" — "}
                    {p.endDate ? new Date(p.endDate).toLocaleDateString() : "ongoing"}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
