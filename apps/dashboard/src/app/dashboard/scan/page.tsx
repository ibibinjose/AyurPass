"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, ErrorNote, Field, Input } from "@/components/ui";

/**
 * Provider appointment desk / event door scanner.
 * Paste QR payload or type pass serial / check-in token.
 */
export default function ScanPassPage() {
  const [payload, setPayload] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function onScan(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!payload.trim()) {
      setError("Paste or type the QR payload / pass ID.");
      return;
    }
    setBusy(true);
    try {
      const res = await api.scanWellnessPass(payload.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed.");
    } finally {
      setBusy(false);
    }
  }

  const ok = result?.result === "ok";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest">Scan Wellness Pass</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Check guests in at events or the appointment desk. Accepts the full AYPASS QR, pass serial,
          or ticket / booking check-in token.
        </p>
      </div>

      <form onSubmit={onScan} className="space-y-4 rounded-2xl border border-hairline bg-surface p-5">
        <Field label="QR payload or pass ID">
          <Input
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="AYPASS:AP-XXXXXXX:… or scan token"
            autoComplete="off"
            className="font-mono text-sm"
          />
        </Field>
        <ErrorNote message={error} />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Checking…" : "Check in"}
        </Button>
      </form>

      {result ? (
        <div
          className={`rounded-2xl border p-5 ${
            ok ? "border-leaf/40 bg-leaf/10" : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            Result · {String(result.result)}
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-forest">
            {String(result.message || result.holder || "Done")}
          </p>
          {result.holder ? (
            <p className="mt-1 text-sm font-medium text-ink-secondary">
              Guest: {String(result.holder)}
            </p>
          ) : null}
          {result.event ? (
            <p className="mt-1 text-sm text-ink-secondary">Event: {String(result.event)}</p>
          ) : null}
          {result.service ? (
            <p className="mt-1 text-sm text-ink-secondary">Service: {String(result.service)}</p>
          ) : null}
          {result.serialNumber ? (
            <p className="mt-2 font-mono text-xs text-ink-muted">{String(result.serialNumber)}</p>
          ) : null}
          {Array.isArray(result.todayBookings) && result.todayBookings.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-bold text-ink-muted">Today’s appointments</p>
              <ul className="mt-1 text-sm text-forest">
                {(result.todayBookings as { service?: { name?: string } }[]).map((b, i) => (
                  <li key={i}>· {b.service?.name ?? "Session"}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {Array.isArray(result.todayTickets) && result.todayTickets.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-bold text-ink-muted">Today’s event tickets</p>
              <ul className="mt-1 text-sm text-forest">
                {(result.todayTickets as { event?: { title?: string } }[]).map((t, i) => (
                  <li key={i}>· {t.event?.title ?? "Event"}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
