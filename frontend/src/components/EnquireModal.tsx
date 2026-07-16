"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, ErrorNote, Field, Input, Textarea } from "@/components/ui";
import { CheckIcon, XIcon } from "@/components/icons";

/**
 * Lead-capture dialog shown on a provider's public listing page. Lets a visitor
 * reach a practice that doesn't sell through AyurPass — the enquiry lands in the
 * provider's dashboard. Kept as inline state (no native dialogs).
 */
export function EnquireModal({
  open,
  onClose,
  providerId,
  businessName,
  retreatId,
}: {
  open: boolean;
  onClose: () => void;
  providerId: string;
  businessName: string;
  /** When set, the lead is attributed to this retreat. */
  retreatId?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setError(null);
    setSent(false);
    setBusy(false);
  }

  function close() {
    reset();
    onClose();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.createEnquiry({ providerId, retreatId, name, email, phone: phone || undefined, message });
      setSent(true);
    } catch {
      setError("We couldn't send your enquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-forest/40 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-hairline bg-surface p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="font-display text-xl text-forest">
            {sent ? "Enquiry sent" : `Enquire with ${businessName}`}
          </h2>
          <button
            onClick={close}
            aria-label="Close"
            className="rounded-full p-1 text-ink-muted hover:bg-clay hover:text-forest"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-leaf/15 text-forest">
              <CheckIcon className="h-6 w-6" />
            </div>
            <p className="mt-4 text-ink-secondary">
              Thanks — {businessName} has received your enquiry and will be in touch soon.
            </p>
            <Button onClick={close} className="mt-6">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <Field label="Your name">
              <Input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ananya Sharma"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Phone (optional)">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 …"
              />
            </Field>
            <Field label="Message">
              <Textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'd love to know more about your Panchakarma programs and availability in October…"
              />
            </Field>
            <ErrorNote message={error} />
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Sending…" : "Send enquiry"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
