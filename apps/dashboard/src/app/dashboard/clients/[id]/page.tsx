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
  
  // Document storage & uploads
  const [docs, setDocs] = useState<{ id: string; name: string; type: string; date: string; url: string }[]>([
    { id: "doc-1", name: "Client Health Intake Form.pdf", type: "Intake Form", date: "2026-07-20", url: "#" },
    { id: "doc-2", name: "Initial Ayurvedic Assessment.pdf", type: "Clinical Report", date: "2026-07-22", url: "#" },
  ]);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("Intake Form");

  // Clinical Progress Tracking
  const [milestones, setMilestones] = useState<{ id: string; title: string; progress: number; date: string; notes: string }[]>([
    { id: "m-1", title: "Initial Consultation & Prakriti Analysis", progress: 100, date: "2026-07-20", notes: "Vata-Pitta constitution identified." },
    { id: "m-2", title: "Panchakarma Preparation Phase", progress: 65, date: "2026-07-23", notes: "Herbal oil therapy in progress." },
  ]);
  const [msTitle, setMsTitle] = useState("");
  const [msProgress, setMsProgress] = useState("75");
  const [msNotes, setMsNotes] = useState("");

  // Secure Messaging
  const [messages, setMessages] = useState<{ id: string; sender: "practitioner" | "client"; text: string; time: string }[]>([
    { id: "msg-1", sender: "client", text: "Hello doctor, should I continue with the recommended herbal tea before bed?", time: "Yesterday, 4:15 PM" },
    { id: "msg-2", sender: "practitioner", text: "Yes, take 1 cup 30 mins before sleep with warm water.", time: "Yesterday, 4:45 PM" },
  ]);
  const [messageInput, setMessageInput] = useState("");

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

          {/* Clinical Progress Tracking */}
          <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg text-forest font-semibold">Clinical Progress Tracking</h2>
                <p className="text-xs text-ink-muted mt-0.5">Track therapy milestones, dosha balance, and recovery goals.</p>
              </div>
              <span className="rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold text-forest">
                Pro Milestone Tracker
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {milestones.map((m) => (
                <div key={m.id} className="rounded-xl border border-hairline bg-clay/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-forest">{m.title}</span>
                    <span className="font-bold text-xs bg-leaf/20 text-forest px-2 py-0.5 rounded-full">{m.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-clay/30 rounded-full overflow-hidden">
                    <div className="h-full bg-forest rounded-full transition-all" style={{ width: `${m.progress}%` }} />
                  </div>
                  <p className="text-xs text-ink-secondary">{m.notes}</p>
                  <p className="text-[10px] text-ink-muted">Logged: {m.date}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!msTitle.trim()) return;
                setMilestones([
                  ...milestones,
                  {
                    id: `m-${Date.now()}`,
                    title: msTitle.trim(),
                    progress: Number(msProgress),
                    date: new Date().toISOString().split("T")[0],
                    notes: msNotes.trim() || "Milestone added",
                  },
                ]);
                setMsTitle("");
                setMsNotes("");
              }}
              className="border-t border-hairline pt-4 space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Log New Milestone</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  required
                  value={msTitle}
                  onChange={(e) => setMsTitle(e.target.value)}
                  placeholder="Milestone title (e.g., Phase 2 Detox)"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={msProgress}
                  onChange={(e) => setMsProgress(e.target.value)}
                  placeholder="Progress %"
                />
              </div>
              <Input
                value={msNotes}
                onChange={(e) => setMsNotes(e.target.value)}
                placeholder="Clinical observation notes..."
              />
              <Button type="submit" variant="soft" className="w-full">
                Log Progress Milestone
              </Button>
            </form>
          </div>

          {/* Secure Document Storage Vault */}
          <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg text-forest font-semibold">Document Vault &amp; Intake Files</h2>
                <p className="text-xs text-ink-muted mt-0.5">Encrypted storage for intake forms, assessments, and lab reports.</p>
              </div>
              <span className="rounded-full bg-clay px-3 py-1 text-xs font-bold text-forest border border-hairline">
                2 Files Stored
              </span>
            </div>

            <ul className="space-y-2 pt-2">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-xl border border-hairline bg-clay/5 p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf/20 text-forest text-xs font-bold">
                      PDF
                    </span>
                    <div>
                      <p className="font-semibold text-foreground truncate max-w-[220px]">{d.name}</p>
                      <p className="text-xs text-ink-muted">{d.type} · {d.date}</p>
                    </div>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading ${d.name}...`);
                    }}
                    className="text-xs font-bold text-forest hover:underline"
                  >
                    View File
                  </a>
                </li>
              ))}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!docName.trim()) return;
                setDocs([
                  ...docs,
                  {
                    id: `doc-${Date.now()}`,
                    name: docName.endsWith(".pdf") ? docName : `${docName}.pdf`,
                    type: docType,
                    date: new Date().toISOString().split("T")[0],
                    url: "#",
                  },
                ]);
                setDocName("");
              }}
              className="border-t border-hairline pt-4 space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Attach Clinical Document</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Document name (e.g. Lab Report)"
                />
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="rounded-xl border border-hairline bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="Intake Form">Intake Form</option>
                  <option value="Clinical Report">Clinical Report</option>
                  <option value="Lab Assessment">Lab Assessment</option>
                  <option value="Consent Form">Consent Form</option>
                </select>
              </div>
              <Button type="submit" variant="soft" className="w-full">
                Upload &amp; Encrypt Document
              </Button>
            </form>
          </div>

          {/* Secure Messaging Surface */}
          <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg text-forest font-semibold">Secure Practitioner Messaging</h2>
                <p className="text-xs text-ink-muted mt-0.5">HIPAA &amp; health-privacy compliant communication channel.</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-forest bg-leaf/20 px-2.5 py-1 rounded-full">
                ● Encrypted Channel
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto rounded-xl border border-hairline bg-clay/5 p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "practitioner" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      m.sender === "practitioner"
                        ? "bg-forest text-white"
                        : "bg-surface border border-hairline text-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!messageInput.trim()) return;
                setMessages([
                  ...messages,
                  {
                    id: `msg-${Date.now()}`,
                    sender: "practitioner",
                    text: messageInput.trim(),
                    time: "Just now",
                  },
                ]);
                setMessageInput("");
              }}
              className="flex gap-2"
            >
              <Input
                required
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Send a secure message to client..."
                className="flex-1"
              />
              <Button type="submit">Send</Button>
            </form>
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
