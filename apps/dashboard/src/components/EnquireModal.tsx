"use client";

import { useEffect, useId, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Button, ErrorNote, Field, Input, Textarea } from "@/components/ui";
import { CheckIcon, XIcon } from "@/components/icons";

/**
 * Lead-capture dialog shown on a provider's public listing page. Lets a visitor
 * reach a practice that doesn't sell through AyurPass — the enquiry lands in the
 * provider's dashboard.
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
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus first field shortly after open.
    const t = window.setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>(
        'input, textarea, button:not([aria-label="Close"])',
      );
      el?.focus();
    }, 30);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) {
        e.preventDefault();
        close();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close uses stable reset
  }, [open, busy]);

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
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Please add a little more detail (at least 10 characters).");
      return;
    }
    setBusy(true);
    try {
      await api.createEnquiry({
        providerId,
        retreatId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      });
      setSent(true);
    } catch {
      setError("We couldn't send your enquiry. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-forest/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => !busy && close()}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-hairline bg-surface p-6 shadow-xl sm:rounded-3xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-display text-xl text-forest">
            {sent ? "Enquiry sent" : `Enquire with ${businessName}`}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-full p-2 text-ink-muted transition-colors hover:bg-clay hover:text-forest"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest text-white shadow-xs">
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
          <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
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
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+61 …"
              />
            </Field>
            <Field label="Message">
              <Textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'd love to know more about your programs and availability…"
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
