/** Local follow & like state — persisted in the browser until account sync ships. */

export type EngagementKind = "provider" | "professional";

export type EngagementTarget = {
  kind: EngagementKind;
  id: string;
};

const FOLLOWS_KEY = "ayurpass.follows";
const LIKES_KEY = "ayurpass.likes";

/** Stable snapshot for useSyncExternalStore — must keep referential equality until data changes. */
export type EngagementSnapshot = { version: number };

const SERVER_SNAPSHOT: EngagementSnapshot = { version: 0 };

function storageKey(target: EngagementTarget): string {
  return `${target.kind}:${target.id}`;
}

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

let follows = new Set<string>();
let likes = new Set<string>();
let snapshot: EngagementSnapshot = { version: 0 };

function reload() {
  follows = readSet(FOLLOWS_KEY);
  likes = readSet(LIKES_KEY);
}

function bump() {
  snapshot = { version: snapshot.version + 1 };
}

function writeSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify([...set]));
  window.dispatchEvent(new Event("ayurpass-engagement"));
}

if (typeof window !== "undefined") {
  reload();
}

export function engagementSnapshot(): EngagementSnapshot {
  return snapshot;
}

export function engagementServerSnapshot(): EngagementSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribeEngagement(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    reload();
    bump();
    cb();
  };
  window.addEventListener("ayurpass-engagement", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("ayurpass-engagement", handler);
    window.removeEventListener("storage", handler);
  };
}

export function isFollowing(target: EngagementTarget): boolean {
  return follows.has(storageKey(target));
}

export function isLiked(target: EngagementTarget): boolean {
  return likes.has(storageKey(target));
}

/** All currently followed practices / practitioners (local storage). */
export function listFollows(): EngagementTarget[] {
  return [...follows]
    .map((k) => {
      const i = k.indexOf(":");
      if (i <= 0) return null;
      const kind = k.slice(0, i) as EngagementKind;
      const id = k.slice(i + 1);
      if ((kind !== "provider" && kind !== "professional") || !id) return null;
      return { kind, id };
    })
    .filter((t): t is EngagementTarget => Boolean(t));
}

export function followCount(): number {
  return follows.size;
}

export function toggleFollow(target: EngagementTarget): boolean {
  const k = storageKey(target);
  if (follows.has(k)) follows.delete(k);
  else follows.add(k);
  writeSet(FOLLOWS_KEY, follows);
  return follows.has(k);
}

export function toggleLike(target: EngagementTarget): boolean {
  const k = storageKey(target);
  if (likes.has(k)) likes.delete(k);
  else likes.add(k);
  writeSet(LIKES_KEY, likes);
  return likes.has(k);
}