"use client";

import { useEffect, useId, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import {
  ABUSE_OPTIONS,
  FEEDBACK_MAX_MESSAGE,
  FEEDBACK_MIN_MESSAGE,
  SUGGESTION_OPTIONS,
  type FeedbackKind,
} from "@/lib/feedback";
import { Button, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";
import { CheckIcon, FlagIcon, SparkleIcon, XIcon } from "@/components/icons";

export type { FeedbackKind };

export function ReportSuggestModal({
  open,
  onClose,
  kind: initialKind = "abuse",
  targetType,
  targetId,
  targetLabel,
  /** When true, hide kind switcher (e.g. profile Report button always abuse). */
  lockKind,
}: {
  open: boolean;
  onClose: () => void;
  kind?: FeedbackKind;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  lockKind?: boolean;
}) {
  const { user } = useAuth();
  const titleId = useId();
  const [kind, setKind] = useState<FeedbackKind>(initialKind);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      setKind(initialKind);
      setCategory(initialKind === "abuse" ? "spam" : "feature");
      setMessage("");
      setError(null);
      setDone(false);
      setRefId(null);
      setContactEmail(user?.email ?? "");
      setContactName(user?.fullName ?? "");
    };
    run();
    return () => {
      active = false;
    };
  }, [open, initialKind, user?.email, user?.fullName]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const options = kind === "abuse" ? ABUSE_OPTIONS : SUGGESTION_OPTIONS;
  const chars = message.trim().length;
  const canSubmit =
    chars >= FEEDBACK_MIN_MESSAGE &&
    chars <= FEEDBACK_MAX_MESSAGE &&
    Boolean(category) &&
    (Boolean(user) || contactEmail.trim().includes("@"));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.submitFeedback({
        kind,
        category,
        message: message.trim(),
        targetType,
        targetId,
        targetLabel,
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactName: contactName.trim() || undefined,
      });
      setRefId(res.id);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not send. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-forest/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-[1] max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-3xl border border-hairline bg-surface shadow-[0_24px_60px_rgba(36,56,46,0.2)]">
        <div className="sticky top-0 z-[1] flex items-start justify-between gap-3 border-b border-hairline bg-surface/95 px-5 py-4 backdrop-blur-sm">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                kind === "abuse" ? "bg-red-50 text-red-700" : "bg-leaf/15 text-forest"
              }`}
            >
              {kind === "abuse" ? (
                <FlagIcon className="h-4 w-4" />
              ) : (
                <SparkleIcon className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                Trust & feedback
              </p>
              <h2 id={titleId} className="mt-0.5 font-display text-xl text-forest">
                {kind === "abuse" ? "Report abuse" : "Send a suggestion"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink-muted hover:bg-clay/60 hover:text-forest"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="space-y-4 px-5 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-leaf/15 text-forest">
              <CheckIcon className="h-6 w-6" strokeWidth={2} />
            </span>
            <p className="font-display text-lg text-forest">Thank you</p>
            <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-ink-secondary">
              {kind === "abuse"
                ? "Your report was received. Our trust & safety team will review it for quality and safety."
                : "Your suggestion was received. We read every note to improve AyurPass."}
            </p>
            {refId ? (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Reference · {refId.slice(0, 8).toUpperCase()}
              </p>
            ) : null}
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 px-5 py-5">
            {!lockKind ? (
              <div className="inline-flex w-full rounded-full border border-hairline bg-clay/30 p-0.5 sm:w-auto">
                {(
                  [
                    { id: "abuse" as const, label: "Report abuse", Icon: FlagIcon },
                    { id: "suggestion" as const, label: "Suggestion", Icon: SparkleIcon },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setKind(t.id);
                      setCategory(t.id === "abuse" ? "spam" : "feature");
                    }}
                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold sm:flex-none ${
                      kind === t.id ? "bg-forest text-white" : "text-ink-muted"
                    }`}
                  >
                    <t.Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
            ) : null}

            {targetLabel ? (
              <p className="rounded-xl bg-clay/40 px-3 py-2 text-xs font-medium text-ink-secondary">
                About: <span className="font-semibold text-forest">{targetLabel}</span>
                {targetType ? (
                  <span className="ml-1 text-ink-muted">· {targetType}</span>
                ) : null}
              </p>
            ) : (
              <p className="text-xs font-medium leading-relaxed text-ink-muted">
                {kind === "abuse"
                  ? "Help us keep AyurPass safe. Reports are reviewed by our team — not shared publicly."
                  : "Tell us what would make AyurPass better for seekers or practices."}
              </p>
            )}

            <Field label="Category">
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label={kind === "abuse" ? "What happened?" : "Your idea"}
              hint="Be specific — this helps us act faster."
            >
              <Textarea
                required
                rows={4}
                minLength={FEEDBACK_MIN_MESSAGE}
                maxLength={FEEDBACK_MAX_MESSAGE}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  kind === "abuse"
                    ? "Describe the issue, links, or behaviour you want us to review…"
                    : "What would make AyurPass better for seekers or practices?"
                }
              />
              <p
                className={`mt-1 text-right text-[11px] font-medium tabular-nums ${
                  chars > 0 && chars < FEEDBACK_MIN_MESSAGE
                    ? "text-amber-700"
                    : "text-ink-muted"
                }`}
              >
                {chars < FEEDBACK_MIN_MESSAGE && chars > 0
                  ? `${FEEDBACK_MIN_MESSAGE - chars} more characters needed`
                  : `${chars} / ${FEEDBACK_MAX_MESSAGE}`}
              </p>
            </Field>

            {!user ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Your name" optional>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Optional"
                    maxLength={120}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Email" required hint="So we can follow up if needed.">
                  <Input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@email.com"
                    maxLength={160}
                    autoComplete="email"
                  />
                </Field>
              </div>
            ) : (
              <p className="rounded-xl bg-clay/30 px-3 py-2 text-xs font-medium text-ink-muted">
                Submitting as{" "}
                <span className="font-semibold text-forest">
                  {user.fullName || user.email}
                </span>
              </p>
            )}

            <ErrorNote message={error} />

            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" disabled={busy || !canSubmit}>
                {busy ? "Sending…" : kind === "abuse" ? "Submit report" : "Send suggestion"}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                Cancel
              </Button>
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-ink-muted">
              {kind === "abuse"
                ? "We use reports for trust & safety only. False or malicious reports may be limited. Do not include sensitive medical details unless necessary."
                : "Suggestions help product planning. We may not reply to every idea, but they are logged and reviewed."}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

/** Small text buttons that open the report / suggest modal. */
export function ReportSuggestTrigger({
  targetType,
  targetId,
  targetLabel,
  className = "",
  label = "Report or suggest",
  /** Default kind when using a single combined label button */
  defaultKind = "abuse",
  compact,
}: {
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  className?: string;
  label?: string;
  defaultKind?: FeedbackKind;
  /** Single compact control instead of Report · Suggest split */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>(defaultKind);

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => {
            setKind(defaultKind);
            setOpen(true);
          }}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted underline-offset-2 hover:text-red-700 hover:underline ${className}`}
        >
          <FlagIcon className="h-3.5 w-3.5" />
          {label}
        </button>
      ) : (
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
          <button
            type="button"
            onClick={() => {
              setKind("abuse");
              setOpen(true);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted underline-offset-2 hover:text-red-700 hover:underline"
          >
            <FlagIcon className="h-3.5 w-3.5" />
            Report abuse
          </button>
          <span className="text-ink-muted/40" aria-hidden>
            ·
          </span>
          <button
            type="button"
            onClick={() => {
              setKind("suggestion");
              setOpen(true);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted underline-offset-2 hover:text-forest hover:underline"
          >
            <SparkleIcon className="h-3.5 w-3.5" />
            Suggest improvement
          </button>
        </div>
      )}
      <ReportSuggestModal
        open={open}
        onClose={() => setOpen(false)}
        kind={kind}
        targetType={targetType}
        targetId={targetId}
        targetLabel={targetLabel}
      />
    </>
  );
}
