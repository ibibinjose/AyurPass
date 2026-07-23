/**
 * Workspace personas — who sees what after login.
 * Modes can be switched when the account has multiple capabilities
 * (e.g. practice owner who is also a seeker, or platform admin).
 */

import type { UserProfile } from "@/lib/types";

export type WorkspaceMode = "seeker" | "practice" | "staff" | "careers" | "admin";

export const WORKSPACE_MODE_KEY = "ayurpass.dashboard.workspaceMode";

export const MODE_META: Record<
  WorkspaceMode,
  { label: string; short: string; home: string; description: string }
> = {
  seeker: {
    label: "Seeker",
    short: "Seeker",
    home: "/dashboard",
    description: "Discover, book, quiz, rewards",
  },
  practice: {
    label: "Practice",
    short: "Hub",
    home: "/dashboard",
    description: "Services, staff, calendar, payments",
  },
  staff: {
    label: "Therapist / staff",
    short: "Staff",
    home: "/dashboard/calendar",
    description: "Your schedule, clients & sessions",
  },
  careers: {
    label: "Careers",
    short: "Jobs",
    home: "/careers",
    description: "Open roles & applications",
  },
  admin: {
    label: "Platform admin",
    short: "Admin",
    home: "/dashboard",
    description: "Verify practices, vanity, overview",
  },
};

export function canAccessPractice(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return (
    user.role === "PROVIDER_ADMIN" ||
    user.role === "PLATFORM_ADMIN" ||
    Boolean(user.provider)
  );
}

export function canAccessStaff(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return (
    user.role === "PROFESSIONAL" ||
    user.role === "PROVIDER_ADMIN" ||
    user.role === "PLATFORM_ADMIN" ||
    Boolean(user.professional)
  );
}

export function canAccessAdmin(user: UserProfile | null | undefined): boolean {
  return user?.role === "PLATFORM_ADMIN";
}

/**
 * Modes this account may switch into.
 * Pure seekers (CONSUMER, no practice/staff links) only get Seeker —
 * no Admin/Hub/Jobs workspace chips. Careers is a page link inside Seeker, not a mode.
 * Multi-role accounts (practice, staff, admin) can switch and also open Seeker.
 */
export function availableModes(
  user: UserProfile | null | undefined,
  opts?: { hasStaffMemberships?: boolean },
): WorkspaceMode[] {
  if (!user) return [];

  const pureSeeker =
    user.role === "CONSUMER" &&
    !user.provider &&
    !user.professional &&
    !opts?.hasStaffMemberships;

  if (pureSeeker) {
    return ["seeker"];
  }

  const modes: WorkspaceMode[] = [];
  if (canAccessAdmin(user)) modes.push("admin");
  if (canAccessPractice(user)) modes.push("practice");
  if (canAccessStaff(user) || opts?.hasStaffMemberships) modes.push("staff");
  // Wellness seeker view for multi-role users (browse/book as a client)
  modes.push("seeker");
  // Hiring / job board workspace only for practice or admin (post & manage roles)
  if (canAccessPractice(user) || canAccessAdmin(user)) {
    modes.push("careers");
  }
  return [...new Set(modes)];
}

/** Default workspace when signing in (or no saved preference). */
export function defaultMode(
  user: UserProfile | null | undefined,
  opts?: { hasStaffMemberships?: boolean },
): WorkspaceMode {
  if (!user) return "seeker";
  if (user.role === "PLATFORM_ADMIN") return "admin";
  if (user.role === "PROVIDER_ADMIN" || user.provider) return "practice";
  if (user.role === "PROFESSIONAL" || user.professional || opts?.hasStaffMemberships) {
    return "staff";
  }
  return "seeker";
}

export function isWorkspaceMode(value: string | null | undefined): value is WorkspaceMode {
  return (
    value === "seeker" ||
    value === "practice" ||
    value === "staff" ||
    value === "careers" ||
    value === "admin"
  );
}

/** Resolve stored preference if still allowed; else default. */
export function resolveMode(
  user: UserProfile | null | undefined,
  stored: string | null | undefined,
  opts?: { hasStaffMemberships?: boolean },
): WorkspaceMode {
  const allowed = availableModes(user, opts);
  if (isWorkspaceMode(stored) && allowed.includes(stored)) return stored;
  // migrate old key values
  if (stored === "provider" && allowed.includes("practice")) return "practice";
  return defaultMode(user, opts);
}

export function homeForUser(user: UserProfile | null | undefined): string {
  if (!user) return "/dashboard";
  return MODE_META[defaultMode(user)].home;
}

export function homeForMode(mode: WorkspaceMode): string {
  return MODE_META[mode].home;
}

export function roleDisplayLabel(role: string | undefined): string {
  switch (role) {
    case "CONSUMER":
      return "Seeker";
    case "PROFESSIONAL":
      return "Practitioner";
    case "PROVIDER_ADMIN":
      return "Practice admin";
    case "PLATFORM_ADMIN":
      return "Platform admin";
    default:
      return role?.replace(/_/g, " ") || "Member";
  }
}

export function readStoredMode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.localStorage.getItem(WORKSPACE_MODE_KEY) ||
      // legacy toggle key
      window.localStorage.getItem("ayurpass.dashboard.viewModeOverride")
    );
  } catch {
    return null;
  }
}

export function writeStoredMode(mode: WorkspaceMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WORKSPACE_MODE_KEY, mode);
    // keep legacy key in sync for any residual readers
    if (mode === "seeker") {
      window.localStorage.setItem("ayurpass.dashboard.viewModeOverride", "seeker");
    } else if (mode === "practice" || mode === "staff") {
      window.localStorage.setItem("ayurpass.dashboard.viewModeOverride", "provider");
    }
  } catch {
    /* ignore */
  }
}
