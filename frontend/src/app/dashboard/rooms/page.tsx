"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, formatMoney } from "@/lib/api";
import type { Room } from "@/lib/types";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Textarea } from "@/components/ui";

interface FormState {
  id?: string;
  name: string;
  description: string;
  capacity: string;
  hourlyCost: string;
}

const BLANK: FormState = { name: "", description: "", capacity: "1", hourlyCost: "" };

export default function RoomsPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .roomsByProvider(provider.id)
      .then(setRooms)
      .catch(() => setRooms([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return <EmptyState title="No practice linked" body="Rooms are managed by provider accounts." />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !provider) return;
    setBusy(true);
    setError(null);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      capacity: Number(form.capacity) || 1,
      hourlyCost: form.hourlyCost ? Number(form.hourlyCost) : undefined,
    };
    try {
      if (form.id) {
        await api.updateRoom(form.id, payload);
      } else {
        await api.createRoom({ ...payload, providerId: provider.id });
      }
      setForm(null);
      reload();
    } catch {
      setError("The room couldn't be saved. Please check the fields and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(room: Room) {
    if (!window.confirm(`Delete “${room.name}”? Appointments assigned to it will be unassigned.`))
      return;
    await api.deleteRoom(room.id).catch(() => setError("The room couldn't be deleted."));
    reload();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
            Organiser
          </p>
          <h1 className="mt-1 font-display text-3xl text-forest">Rooms & spaces</h1>
          <p className="mt-1 text-ink-muted">
            Treatment rooms for concurrent care — use calendar “By room” view to see who is in each
            space at the same time. Double-booking a room is blocked automatically.
          </p>
        </div>
        {!form && (
          <Button onClick={() => setForm(BLANK)}>
            <PlusIcon className="h-4 w-4" />
            New room
          </Button>
        )}
      </div>

      {form && (
        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-2xl border border-hairline bg-surface p-6"
        >
          <h2 className="font-display text-xl text-forest">{form.id ? "Edit room" : "New room"}</h2>
          <Field label="Name">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Panchakarma Suite 1"
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Equipment, ambience, accessibility…"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Capacity (people)">
              <Input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </Field>
            <Field label="Operating cost per hour (USD)" hint="Optional — internal cost tracking.">
              <Input
                type="number"
                min="0"
                step="1"
                value={form.hourlyCost}
                onChange={(e) => setForm({ ...form, hourlyCost: e.target.value })}
                placeholder="40"
              />
            </Field>
          </div>
          <ErrorNote message={error} />
          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : form.id ? "Save changes" : "Add room"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8">
        {rooms === null ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : rooms.length === 0 && !form ? (
          <EmptyState
            title="No rooms yet"
            body="Add your treatment rooms and studios so appointments can be assigned a space — and so you can track the cost of running them."
          />
        ) : (
          <ul className="space-y-3">
            {rooms.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-5 py-4"
              >
                <div>
                  <p className="font-medium text-foreground">{r.name}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    Capacity {r.capacity}
                    {r.hourlyCost != null && ` · ${formatMoney(r.hourlyCost)}/hour operating cost`}
                    {r.description && ` · ${r.description}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    title="Edit"
                    onClick={() =>
                      setForm({
                        id: r.id,
                        name: r.name,
                        description: r.description ?? "",
                        capacity: String(r.capacity),
                        hourlyCost: r.hourlyCost != null ? String(Number(r.hourlyCost)) : "",
                      })
                    }
                    className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-leaf hover:text-forest"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => remove(r)}
                    className="rounded-full border border-hairline p-2 text-ink-secondary hover:border-red-300 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
