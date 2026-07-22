"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { ClientRecord, ClientNote, Booking, Order } from "@/lib/types";
import { DashHeader } from "@/components/dashboard/DashboardKit";
import { Button, EmptyState, ErrorNote, Field, Input, Textarea, InlineSpinner } from "@/components/ui";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";

export default function ClientDetailPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const { id: consumerId } = useParams();
  const router = useRouter();

  const [client, setClient] = useState<ClientRecord | null>(null);
  const [noteText, setNoteText] = useState("");
  const [newTag, setNewTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider || !consumerId) return;
    api
      .crmClientDetail(provider.id, consumerId as string)
      .then(setClient)
      .catch(() => setClient(null));
  }, [provider, consumerId]);

  useEffect(reload, [reload]);

  if (!provider) {
    return <EmptyState title="No practice linked" body="Client details are available for provider accounts." />;
  }

  if (client === null) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 w-1/3 bg-clay/70 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="h-60 bg-clay/70 rounded-2xl" />
          <div className="h-60 bg-clay/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim() || !provider || !consumerId) return;
    setBusy(true);
    setError(null);
    try {
      await api.addCrmClientNote(provider.id, consumerId as string, { note: noteText.trim() });
      setNoteText("");
      reload();
    } catch {
      setError("Failed to add consultation note.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.deleteCrmClientNote(noteId);
      reload();
    } catch {
      setError("Failed to delete note.");
    }
  }

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTag.trim() || !provider || !consumerId || !client) return;
    const cleanTag = newTag.trim();
    if (client.tags?.includes(cleanTag)) {
      setNewTag("");
      return;
    }
    const tags = [...(client.tags ?? []), cleanTag];
    try {
      await api.updateCrmClient(provider.id, consumerId as string, { tags });
      setNewTag("");
      reload();
    } catch {
      setError("Failed to add tag.");
    }
  }

  async function handleRemoveTag(tag: string) {
    if (!provider || !consumerId || !client) return;
    const tags = (client.tags ?? []).filter((t: string) => t !== tag);
    try {
      await api.updateCrmClient(provider.id, consumerId as string, { tags });
      reload();
    } catch {
      setError("Failed to remove tag.");
    }
  }

  if (!client) {
    return (
      <div className="flex justify-center items-center py-20">
        <InlineSpinner label="Loading client record..." />
      </div>
    );
  }

  const clientUser = client.consumer?.user;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="text-sm font-semibold text-ink-muted hover:text-forest flex items-center gap-1.5"
        >
          ← Back to Directory
        </button>
      </div>

      <DashHeader
        eyebrow="Client Record"
        title={clientUser?.fullName ?? "Unnamed Client"}
        description={`${clientUser?.email} · ${clientUser?.phone ?? "No phone recorded"}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] mt-8">
        {/* Left Column: Notes & File Details */}
        <div className="space-y-6">
          {/* Tags Section */}
          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <h2 className="font-display text-lg text-forest font-semibold">Client tags</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {client.tags?.map((t: string) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1 text-sm font-semibold text-forest"
                >
                  {t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-leaf/30 text-forest/70 hover:text-forest"
                    title="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
              {(!client.tags || client.tags.length === 0) && (
                <span className="text-sm text-ink-muted">No tags added yet.</span>
              )}
            </div>

            <form onSubmit={handleAddTag} className="mt-4 flex max-w-xs gap-2">
              <Input
                size={30}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag (e.g. VIP, Prakriti)"
                className="!py-1.5"
              />
              <Button type="submit" variant="soft" className="!min-h-8">
                Add
              </Button>
            </form>
          </div>

          {/* Consultation Notes */}
          <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-4">
            <h2 className="font-display text-lg text-forest font-semibold">Consultation & internal notes</h2>

            <form onSubmit={handleAddNote} className="space-y-3">
              <Textarea
                required
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a consultation log or administrative note here..."
              />
              <Button type="submit" disabled={busy}>
                {busy ? "Adding note..." : "Add Consultation Note"}
              </Button>
            </form>

            <ErrorNote message={error} />

            <div className="border-t border-hairline pt-4 space-y-4 mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Notes History</h3>
              {client.notes?.length === 0 ? (
                <p className="text-sm text-ink-muted">No notes recorded yet.</p>
              ) : (
                <ul className="space-y-4">
                  {client.notes?.map((n: ClientNote) => (
                    <li key={n.id} className="rounded-xl bg-clay/20 p-4 relative group">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{n.note}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                        <span>
                          {new Date(n.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:underline"
                        >
                          Delete Note
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interaction History (Bookings & Purchases) */}
        <aside className="space-y-6">
          {/* Booking History */}
          <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-4">
            <h2 className="font-display text-base text-forest font-semibold">Bookings history</h2>
            {client.bookings?.length === 0 ? (
              <p className="text-sm text-ink-muted">No bookings with this client yet.</p>
            ) : (
              <ul className="space-y-3">
                {client.bookings?.map((b: Booking) => (
                  <li key={b.id} className="rounded-xl border border-hairline bg-clay/5 p-3.5 space-y-1">
                    <p className="font-semibold text-foreground text-sm truncate">{b.service?.name}</p>
                    <p className="text-xs text-ink-secondary">
                      {new Date(b.startTime).toLocaleDateString(undefined, { dateStyle: "medium" })} ·{" "}
                      {new Date(b.startTime).toLocaleTimeString(undefined, { timeStyle: "short" })}
                    </p>
                    {b.professional?.user?.fullName && (
                      <p className="text-xs text-ink-muted">Therapist: {b.professional.user.fullName}</p>
                    )}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="font-semibold">{formatMoney(b.totalAmount)}</span>
                      <PaymentBadge status={b.paymentStatus} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Product Purchases */}
          <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-4">
            <h2 className="font-display text-base text-forest font-semibold">Purchase history</h2>
            {client.orders?.length === 0 ? (
              <p className="text-sm text-ink-muted">No product purchases yet.</p>
            ) : (
              <ul className="space-y-3">
                {client.orders?.map((o: Order) => (
                  <li key={o.id} className="rounded-xl border border-hairline bg-clay/5 p-3.5 space-y-1.5">
                    <p className="font-semibold text-foreground text-xs truncate">
                      {o.items?.map((i) => `${i.quantity}× ${i.product?.name ?? "Product"}`).join(", ")}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {new Date(o.createdAt).toLocaleDateString(undefined, { dateStyle: "short" })}
                      {o.paymentMethod && ` · via ${o.paymentMethod}`}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="font-semibold">{formatMoney(o.subtotal)}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
