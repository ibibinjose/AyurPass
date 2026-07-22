/** Profile accent themes — vibrant, lively personalization (not muted/dark). */

export type ProfileAccentId = "forest" | "gold" | "ocean" | "plum" | "clay";

export interface ProfileAccent {
  id: ProfileAccentId;
  label: string;
  /** CSS color for rings / primary actions — saturated mid-tones */
  primary: string;
  soft: string;
  gradient: string;
}

/**
 * Vibrant accents: bright enough for energy, still strong enough for white CTAs.
 * Soft fills use higher alpha so chips/buttons feel present, not washed out.
 */
export const PROFILE_ACCENTS: ProfileAccent[] = [
  {
    id: "forest",
    label: "Forest",
    primary: "#22a06b",
    soft: "rgba(34, 160, 107, 0.18)",
    gradient:
      "linear-gradient(145deg, #2dd4a0 0%, #22a06b 42%, #8fd9b5 78%, #fff8e8 100%)",
  },
  {
    id: "gold",
    label: "Gold",
    /** Deep enough for white CTAs, still bright saffron-gold */
    primary: "#d4940a",
    soft: "rgba(212, 148, 10, 0.2)",
    gradient:
      "linear-gradient(145deg, #ffc83d 0%, #d4940a 45%, #f5d76e 75%, #fff9ec 100%)",
  },
  {
    id: "ocean",
    label: "Ocean",
    primary: "#0db4c4",
    soft: "rgba(13, 180, 196, 0.18)",
    gradient:
      "linear-gradient(145deg, #2dd4e0 0%, #0db4c4 42%, #7ee0ea 78%, #e8fafc 100%)",
  },
  {
    id: "plum",
    label: "Plum",
    primary: "#b44fd4",
    soft: "rgba(180, 79, 212, 0.18)",
    gradient:
      "linear-gradient(145deg, #d478f0 0%, #b44fd4 42%, #e0a8f5 78%, #faf0ff 100%)",
  },
  {
    id: "clay",
    label: "Clay",
    primary: "#e07a3d",
    soft: "rgba(224, 122, 61, 0.18)",
    gradient:
      "linear-gradient(145deg, #f0a06a 0%, #e07a3d 45%, #f5c4a0 78%, #fff6ef 100%)",
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
