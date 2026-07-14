"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { UserProfile } from "@/lib/types";
import { EmptyState } from "@/components/ui";

const ROLE_LABEL: Record<string, string> = {
  CONSUMER: "Wellness seeker",
  PROFESSIONAL: "Practitioner",
  PROVIDER_ADMIN: "Provider admin",
  PLATFORM_ADMIN: "Platform admin",
};

type AdminUser = UserProfile & { provider?: { id: string; businessName: string } | null };

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[] | null>(null);

  useEffect(() => {
    api
      .adminUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  if (user && user.role !== "PLATFORM_ADMIN") {
    return <EmptyState title="Admin only" body="This area is for platform administrators." />;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Users</h1>
      <p className="mt-1 text-ink-muted">Every account on the platform, newest first.</p>

      <div className="mt-8">
        {users === null ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Practice</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-hairline/60 last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{u.fullName ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-secondary">{u.email}</td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {ROLE_LABEL[u.role] ?? u.role}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {u.provider?.businessName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
