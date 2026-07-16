import type { ConsentEffectiveStatus, PermissionType } from "./types";

/** Human-readable catalog for every grantable health permission. */
export interface PermissionDefinition {
  type: PermissionType | string;
  title: string;
  description: string;
  /** Short label for chips / badges. */
  shortLabel: string;
}

export const PERMISSION_CATALOG: Record<string, PermissionDefinition> = {
  view_health_profile: {
    type: "view_health_profile",
    title: "Health profile",
    shortLabel: "Profile",
    description:
      "Lets this practice see your dosha scores and health profile while delivering care.",
  },
  view_dosha_history: {
    type: "view_dosha_history",
    title: "Dosha history",
    shortLabel: "Dosha",
    description:
      "Lets this practitioner review your past assessments and dosha trends for your booked sessions.",
  },
  view_treatment_plans: {
    type: "view_treatment_plans",
    title: "Treatment plans",
    shortLabel: "Plans",
    description: "Share active and past treatment plans with this care team.",
  },
  edit_notes: {
    type: "edit_notes",
    title: "Clinical notes",
    shortLabel: "Notes",
    description: "Allow practitioners to add session notes to your health record.",
  },
  full_health_access: {
    type: "full_health_access",
    title: "Full health access",
    shortLabel: "Full access",
    description:
      "Broad read access to your health data. Only grant this to trusted long-term practitioners.",
  },
};

export function permissionDefinition(type: string): PermissionDefinition {
  return (
    PERMISSION_CATALOG[type] ?? {
      type,
      title: type.replace(/_/g, " "),
      shortLabel: type.replace(/_/g, " "),
      description: "Custom data-sharing permission.",
    }
  );
}

export const CONSENT_STATUS_STYLES: Record<ConsentEffectiveStatus, string> = {
  active: "bg-forest text-white",
  revoked: "bg-red-50 text-red-700",
  expired: "bg-clay text-ink-secondary",
};

export function formatConsentDate(value?: string | null): string {
  if (!value) return "No expiry";
  try {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
