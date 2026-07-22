"use client";

import { useState } from "react";
import { Field, Input, Select, Textarea, Button, ErrorNote } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

const SUPPORT_EMAIL = "hello@ayurpass.com";

const TOPICS = [
  "General enquiry",
  "Help with a booking",
  "Billing or refunds",
  "Becoming a provider",
  "Privacy or data request",
  "Report a problem",
] as const;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please tell us your name.");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    if (message.trim().length < 10)
      return setError("Please add a little more detail (at least 10 characters).");

    const subject = `[${topic}] from ${name.trim()}`;
    const body = `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    // Hand off to the visitor's mail client with everything pre-filled.
    window.location.href = mailto;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-leaf text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-xl text-forest">Your message is ready to send</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
          We&apos;ve opened your email app with your message pre-filled to {SUPPORT_EMAIL}. If nothing
          opened, you can email us directly at{" "}
          <a className="font-medium text-forest underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          . We typically reply within one business day.
        </p>
        <Button variant="ghost" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Sharma" />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
      </div>
      <div className="mt-5">
        <Field label="Topic">
          <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="mt-5">
        <Field label="How can we help?">
          <Textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share as much detail as you can and we'll point you to the right place."
          />
        </Field>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorNote message={error} />
        </div>
      )}

      <Button type="submit" className="mt-6 w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
