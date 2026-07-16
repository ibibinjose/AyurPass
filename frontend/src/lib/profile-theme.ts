/** Profile accent themes — neo-minimal personalization. */

export type ProfileAccentId = "forest" | "gold" | "ocean" | "plum" | "clay";

export interface ProfileAccent {
  id: ProfileAccentId;
  label: string;
  /** CSS color for rings / primary actions */
  primary: string;
  soft: string;
  gradient: string;
}

export const PROFILE_ACCENTS: ProfileAccent[] = [
  {
    id: "forest",
    label: "Forest",
    primary: "#1e3228",
    soft: "rgba(47, 90, 68, 0.14)",
    gradient: "linear-gradient(145deg, #1e3228 0%, #3d6650 55%, #e9d9b8 100%)",
  },
  {
    id: "gold",
    label: "Gold",
    primary: "#a67a24",
    soft: "rgba(166, 122, 36, 0.16)",
    gradient: "linear-gradient(145deg, #5c3d0e 0%, #a67a24 50%, #e9d9b8 100%)",
  },
  {
    id: "ocean",
    label: "Ocean",
    primary: "#0a6b6b",
    soft: "rgba(10, 107, 107, 0.14)",
    gradient: "linear-gradient(145deg, #0a3d4a 0%, #0a6b6b 50%, #c5e8e4 100%)",
  },
  {
    id: "plum",
    label: "Plum",
    primary: "#5c3d6e",
    soft: "rgba(92, 61, 110, 0.14)",
    gradient: "linear-gradient(145deg, #3a2548 0%, #7a5590 55%, #e8d9f0 100%)",
  },
  {
    id: "clay",
    label: "Clay",
    primary: "#8b5e3c",
    soft: "rgba(139, 94, 60, 0.14)",
    gradient: "linear-gradient(145deg, #4a3220 0%, #8b5e3c 50%, #efe8d9 100%)",
  },
];

const STORAGE_KEY = "ayurpass.profileAccent";

export function getStoredAccentId(): ProfileAccentId {
  if (typeof window === "undefined") return "forest";
  const v = window.localStorage.getItem(STORAGE_KEY) as ProfileAccentId | null;
  return PROFILE_ACCENTS.some((a) => a.id === v) ? (v as ProfileAccentId) : "forest";
}

export function setStoredAccentId(id: ProfileAccentId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function accentById(id: ProfileAccentId): ProfileAccent {
  return PROFILE_ACCENTS.find((a) => a.id === id) ?? PROFILE_ACCENTS[0];
}
