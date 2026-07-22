"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { StaffMember, StaffRole } from "@/lib/types";
import { PlusIcon, TrashIcon, UsersIcon, PencilIcon, ShieldIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Select, SuccessNote } from "@/components/ui";

const ROLE_LABELS: Record<StaffRole, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  RECEPTIONIST: "Receptionist",
  PRACTITIONER: "Practitioner",
};

const ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  OWNER: "Full access — billing, staff, settings, everything",
  MANAGER: "Manage services, bookings, clients, reports — no billing or settings",
  RECEPTIONIST: "View bookings, manage calendar, POS sales, client check-in",
  PRACTITIONER: "View own bookings and clients only",
};

const ROLE_COLORS: Record<StaffRole, string> = {
  OWNER: "bg-forest text-white",
  MANAGER: "bg-leaf/20 text-forest",
  RECEPTIONIST: "bg-gold-soft text-forest",
  PRACTITIONER: "bg-clay text-ink-secondary",
};

const INVITABLE_ROLES: StaffRole[] = ["MANAGER", "RECEPTIONIST", "PRACTITIONER"];

export default function StaffPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const canManage = user?.role === "PROVIDER_ADMIN" || user?.role === "PLATFORM_ADMIN";

  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffRole>("RECEPTIONIST");
  const [inviteName, setInviteName] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);

  // Edit form
  const [editRole, setEditRole] = useState<StaffRole>("RECEPTIONIST");
  const [editName, setEditName] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .listStaff(provider.id)
      .then(setStaff)
      .catch(() => setStaff([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return (
      <EmptyState
        title="No practice linked"
        body="Staff management is available for provider accounts."
      />
    );
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setInviteBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await api.inviteStaff(provider.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
        displayName: inviteName.trim() || undefined,
      });
      setSuccess(`Invitation sent to ${result.inviteEmail} as ${ROLE_LABELS[inviteRole]}.`);
      setShowInvite(false);
      setInviteEmail("");
      setInviteName("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation.");
    } finally {
      setInviteBusy(false);
    }
  }

  function startEdit(member: StaffMember) {
    setEditingId(member.id);
    setEditRole(member.role);
    setEditName(member.displayName || "");
    setError(null);
    setSuccess(null);
  }

  async function handleUpdate(staffId: string) {
    if (!provider) return;
    setEditBusy(true);
    setError(null);
    try {
      await api.updateStaffMember(provider.id, staffId, {
        role: editRole,
        displayName: editName.trim() || undefined,
      });
      setEditingId(null);
      setSuccess("Staff member updated.");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update staff member.");
    } finally {
      setEditBusy(false);
    }
  }

  async function handleRemove(member: StaffMember) {
    if (!provider) return;
    const name = member.user?.fullName || member.inviteEmail || "this person";
    if (!window.confirm(`Remove ${name} from the team? They will lose all access to this practice.`))
      return;
    setError(null);
    setSuccess(null);
    try {
      await api.removeStaffMember(provider.id, member.id);
      setSuccess(`${name} has been removed.`);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove staff member.");
    }
  }

  const activeStaff = staff?.filter((s) => s.inviteStatus === "ACCEPTED") ?? [];
  const pendingStaff = staff?.filter((s) => s.inviteStatus === "PENDING") ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--system-blue)]">
            Practice
          </p>
          <h1 className="mt-1 font-display text-3xl text-forest">Staff & Access</h1>
          <p className="mt-1 text-ink-muted">
            Manage who can access your practice dashboard and what they can do.
          </p>
        </div>
        {canManage && !showInvite && (
          <Button onClick={() => { setShowInvite(true); setError(null); setSuccess(null); }}>
            <PlusIcon className="h-4 w-4" />
            Invite staff
          </Button>
        )}
      </div>

      <SuccessNote message={success} />
      <ErrorNote message={error} />

      {/* Invite form */}
      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="mt-6 space-y-4 rounded-2xl border border-hairline bg-surface p-6"
        >
          <h2 className="font-display text-xl text-forest">Invite a team member</h2>
          <p className="text-sm text-ink-muted">
            They will receive an email invitation. Once they sign in to AyurPass and accept, they
            gain access based on their role.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email address">
              <Input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="team@example.com"
              />
            </Field>
            <Field label="Display name" hint="How they appear in your team">
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Dr. Ananya"
              />
            </Field>
          </div>

          <Field label="Role">
            <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as StaffRole)}>
              {INVITABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]} — {ROLE_DESCRIPTIONS[r]}
                </option>
              ))}
            </Select>
          </Field>

          {/* Permission preview */}
          <div className="rounded-xl border border-hairline bg-clay/30 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-2">
              {ROLE_LABELS[inviteRole]} permissions
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                const allowed = DEFAULT_PERMS[inviteRole]?.[key] ?? false;
                return (
                  <span
                    key={key}
                    className={`flex items-center gap-1.5 ${allowed ? "text-forest" : "text-ink-muted/50 line-through"}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${allowed ? "bg-leaf" : "bg-hairline"}`} />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={inviteBusy}>
              {inviteBusy ? "Sending…" : "Send invitation"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Active staff list */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wide mb-3">
          Active ({activeStaff.length})
        </h2>
        {staff === null ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-clay/70" />
            ))}
          </div>
        ) : activeStaff.length === 0 && !showInvite ? (
          <EmptyState
            title="No staff yet"
            body="Invite reception, managers, or practitioners so they can access the dashboard with role-appropriate permissions."
            action={
              canManage ? (
                <Button onClick={() => setShowInvite(true)}>
                  <PlusIcon className="h-4 w-4" />
                  Invite your first team member
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {activeStaff.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-surface px-5 py-4"
              >
                {m.user?.avatarUrl ? (
                  <img
                    src={m.user.avatarUrl}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full border border-hairline object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-forest">
                    <UsersIcon className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {m.displayName || m.user?.fullName || m.user?.email || "Staff member"}
                  </p>
                  <p className="truncate text-sm text-ink-muted">
                    {m.user?.email}
                  </p>
                </div>

                {editingId === m.id ? (
                  <div className="flex w-full flex-wrap items-end gap-3 mt-3 pt-3 border-t border-hairline">
                    <Field label="Role" className="flex-1 min-w-[160px]">
                      <Select value={editRole} onChange={(e) => setEditRole(e.target.value as StaffRole)}>
                        {INVITABLE_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Display name" className="flex-1 min-w-[160px]">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Display name"
                      />
                    </Field>
                    <div className="flex gap-2 pb-1">
                      <Button onClick={() => handleUpdate(m.id)} disabled={editBusy}>
                        {editBusy ? "Saving…" : "Save"}
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${ROLE_COLORS[m.role]}`}>
                      {ROLE_LABELS[m.role]}
                    </span>
                    {canManage && m.role !== "OWNER" && (
                      <>
                        <button
                          onClick={() => startEdit(m)}
                          className="rounded-full p-2 text-ink-muted hover:bg-clay hover:text-forest transition-colors"
                          title="Edit role"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(m)}
                          className="rounded-full p-2 text-ink-muted hover:bg-red-50 hover:text-red-700 transition-colors"
                          title="Remove"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pending invitations */}
      {pendingStaff.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wide mb-3">
            Pending invitations ({pendingStaff.length})
          </h2>
          <ul className="space-y-3">
            {pendingStaff.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-hairline bg-surface/60 px-5 py-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay/60 text-ink-muted">
                  <ShieldIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {m.displayName || m.inviteEmail || "Invited"}
                  </p>
                  <p className="truncate text-sm text-ink-muted">
                    {m.inviteEmail} — awaiting acceptance
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${ROLE_COLORS[m.role]}`}>
                    {ROLE_LABELS[m.role]}
                  </span>
                  {canManage && (
                    <button
                      onClick={() => handleRemove(m)}
                      className="rounded-full p-2 text-ink-muted hover:bg-red-50 hover:text-red-700 transition-colors"
                      title="Revoke invitation"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Role reference */}
      <div className="mt-10 rounded-2xl border border-hairline bg-clay/20 p-5">
        <h3 className="text-sm font-bold text-forest mb-3">Role permissions reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-hairline">
                <th className="py-2 pr-3 text-left font-semibold text-ink-muted">Permission</th>
                {(["OWNER", "MANAGER", "RECEPTIONIST", "PRACTITIONER"] as StaffRole[]).map((r) => (
                  <th key={r} className="py-2 px-2 text-center font-semibold text-ink-muted">
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                <tr key={key} className="border-b border-hairline/50">
                  <td className="py-1.5 pr-3 text-ink-secondary">{label}</td>
                  {(["OWNER", "MANAGER", "RECEPTIONIST", "PRACTITIONER"] as StaffRole[]).map((r) => (
                    <td key={r} className="py-1.5 px-2 text-center">
                      {DEFAULT_PERMS[r]?.[key] ? (
                        <span className="text-forest font-bold">&#10003;</span>
                      ) : (
                        <span className="text-ink-muted/40">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Constants ---

const PERMISSION_LABELS: Record<string, string> = {
  manage_staff: "Manage staff",
  manage_services: "Manage services",
  manage_bookings: "Manage bookings",
  manage_products: "Manage products",
  manage_calendar: "Manage calendar",
  manage_clients: "Manage clients",
  manage_financials: "Financial settings",
  manage_settings: "Practice settings",
  view_reports: "View reports",
  process_pos: "Process POS sales",
};

const DEFAULT_PERMS: Record<StaffRole, Record<string, boolean>> = {
  OWNER: {
    manage_staff: true,
    manage_services: true,
    manage_bookings: true,
    manage_products: true,
    manage_calendar: true,
    manage_clients: true,
    manage_financials: true,
    manage_settings: true,
    view_reports: true,
    process_pos: true,
  },
  MANAGER: {
    manage_staff: true,
    manage_services: true,
    manage_bookings: true,
    manage_products: true,
    manage_calendar: true,
    manage_clients: true,
    manage_financials: false,
    manage_settings: false,
    view_reports: true,
    process_pos: true,
  },
  RECEPTIONIST: {
    manage_staff: false,
    manage_services: false,
    manage_bookings: true,
    manage_products: false,
    manage_calendar: true,
    manage_clients: true,
    manage_financials: false,
    manage_settings: false,
    view_reports: false,
    process_pos: true,
  },
  PRACTITIONER: {
    manage_staff: false,
    manage_services: false,
    manage_bookings: false,
    manage_products: false,
    manage_calendar: false,
    manage_clients: false,
    manage_financials: false,
    manage_settings: false,
    view_reports: false,
    process_pos: false,
  },
};
