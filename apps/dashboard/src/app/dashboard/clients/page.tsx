"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ClientRecord } from "@/lib/types";
import { DashHeader } from "@/components/dashboard/DashboardKit";
import { EmptyState, Field, Input, Button, Textarea, ErrorNote } from "@/components/ui";

export default function ClientsDirectoryPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;

  const [clients, setClients] = useState<ClientRecord[] | null>(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [campaignModal, setCampaignModal] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .crmClients(provider.id)
      .then(setClients)
      .catch(() => setClients([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return <EmptyState title="No practice linked" body="Client CRM is available for provider accounts." />;
  }

  const filtered = (clients ?? []).filter((c) => {
    if (statusFilter === "blocked" && c.status !== "blocked") return false;
    if (statusFilter === "active" && c.status === "blocked") return false;

    const term = filter.toLowerCase().trim();
    if (!term) return true;
    const name = c.consumer?.user?.fullName?.toLowerCase() ?? "";
    const email = c.consumer?.user?.email?.toLowerCase() ?? "";
    const phone = c.consumer?.user?.phone?.toLowerCase() ?? "";
    const tags = c.tags?.join(" ").toLowerCase() ?? "";
    return name.includes(term) || email.includes(term) || phone.includes(term) || tags.includes(term);
  });

  return (
    <div className="space-y-6">
      <DashHeader
        eyebrow="CRM"
        title="Clients Directory"
        description={`Manage clinical records, tags, notes, activity and customer blocking for clients of ${provider.businessName}.`}
      />

      <div className="flex flex-wrap items-end justify-between gap-4 mt-6">
        <div className="flex flex-1 flex-wrap items-center gap-3 max-w-xl">
          <div className="flex-1 min-w-[220px]">
            <Field label="Search directory">
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search by name, email, phone or tags..."
              />
            </Field>
          </div>
          <div className="w-36">
            <Field label="Status">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "blocked")}
                className="w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-forest"
              >
                <option value="all">All Clients</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </Field>
          </div>
        </div>
        <Button
          onClick={() => {
            setCampaignModal(true);
            setCampaignSubject("");
            setCampaignBody("");
            setError(null);
            setSuccessMsg(null);
          }}
        >
          Email Clients
        </Button>
      </div>

      <div className="mt-8">
        {clients === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter ? "No matching clients found" : "No clients recorded yet"}
            body={filter ? "Try adjusting your search terms." : "When clients book services or order products, they will appear in your CRM directory."}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-clay/20 text-xs font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-5 py-4">Client Name</th>
                  <th className="px-5 py-4">Contact Info</th>
                  <th className="px-5 py-4">Tags</th>
                  <th className="px-5 py-4 text-center">Bookings</th>
                  <th className="px-5 py-4 text-center">Orders</th>
                  <th className="px-5 py-4">Latest Activity</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-sm">
                {filtered.map((c) => {
                  const clientUser = c.consumer?.user;
                  return (
                    <tr key={c.id} className="hover:bg-clay/10 transition-colors">
                      <td className="px-5 py-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{clientUser?.fullName ?? "Unnamed Client"}</span>
                          {c.status === "blocked" && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-800">
                              Blocked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-ink-secondary">
                        <div>{clientUser?.email}</div>
                        {clientUser?.phone && <div className="text-xs text-ink-muted mt-0.5">{clientUser.phone}</div>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tags && c.tags.length > 0 ? (
                            c.tags.map((t: string) => (
                              <span
                                key={t}
                                className="rounded-full bg-leaf/15 px-2.5 py-0.5 text-xs font-semibold text-forest"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-ink-muted">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-medium text-foreground">
                        {c.bookingsCount}
                      </td>
                      <td className="px-5 py-4 text-center font-medium text-foreground">
                        {c.ordersCount}
                      </td>
                      <td className="px-5 py-4 text-xs text-ink-muted">
                        {new Date(c.updatedAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/clients/${c.consumerId}`}
                          className="inline-flex min-h-8 items-center justify-center rounded-full border border-hairline bg-surface px-4 text-xs font-semibold text-ink-secondary hover:border-leaf hover:text-forest"
                        >
                          View File
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {campaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-lg rounded-3xl border border-hairline bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="font-display text-2xl text-forest font-semibold">Email promotion campaign</h2>
            <p className="text-xs text-ink-muted mt-1">
              Send a promotion or announcement email to all active clients of {provider.businessName}.
            </p>

            {successMsg ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-leaf/10 p-4 border border-leaf/25 text-forest text-sm font-medium">
                  {successMsg}
                </div>
                <Button onClick={() => setCampaignModal(false)} className="w-full">
                  Done
                </Button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError(null);
                  try {
                    const res = await api.sendCrmCampaign(provider.id, {
                      subject: campaignSubject.trim(),
                      body: campaignBody.trim(),
                    });
                    setSuccessMsg(
                      `Email campaign successfully sent to ${res.sentCount} clients!`
                    );
                    setCampaignSubject("");
                    setCampaignBody("");
                  } catch {
                    setError("Could not send email campaign. Make sure client lists are populated.");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="mt-4 space-y-4"
              >
                <Field label="Campaign Subject">
                  <Input
                    required
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    placeholder="e.g. 20% off all Abhyanga therapies this week!"
                  />
                </Field>

                <Field label="Message Body">
                  <Textarea
                    required
                    rows={6}
                    value={campaignBody}
                    onChange={(e) => setCampaignBody(e.target.value)}
                    placeholder="Write your email details here... (promotions, timings, coupon codes etc.)"
                  />
                </Field>

                <ErrorNote message={error} />

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={busy}>
                    {busy ? "Sending Campaign..." : "Send Campaign"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setCampaignModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
