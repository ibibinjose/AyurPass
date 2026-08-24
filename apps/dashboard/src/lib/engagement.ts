import { api } from "@/lib/api";

/**
 * Member engagement state. Follows are durable and account-bound; likes remain
 * local until the product has an explicit server-side like interaction.
 */
export type EngagementKind = "provider" | "professional";

export type EngagementTarget = {
  kind: EngagementKind;
  id: string;
};

type FollowRow = { targetType: EngagementKind; targetId: string; createdAt: string };

const LEGACY_FOLLOWS_KEY = "ayurpass.follows";
const LIKES_KEY = "ayurpass.likes";

/** Stable snapshot — required by useSyncExternalStore. */
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
let hydratedForUserId: string | null = null;
let hydrateInFlight: Promise<void> | null = null;

function reloadLocalLikes() {
  likes = readSet(LIKES_KEY);
}

function bump() {
  snapshot = { version: snapshot.version + 1 };
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ayurpass-engagement"));
  }
}

function publish() {
  bump();
  notify();
}

function writeSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify([...set]));
  publish();
}

function asTarget(key: string): EngagementTarget | null {
  const index = key.indexOf(":");
  if (index <= 0) return null;
  const kind = key.slice(0, index) as EngagementKind;
  const id = key.slice(index + 1);
  if ((kind !== "provider" && kind !== "professional") || !id) return null;
  return { kind, id };
}

function applyRemoteFollows(rows: FollowRow[]) {
  follows = new Set(rows.map((row) => `${row.targetType}:${row.targetId}`));
  publish();
}

async function migrateLegacyFollows(remote: FollowRow[]) {
  if (typeof window === "undefined") return remote;

  const legacy = [...readSet(LEGACY_FOLLOWS_KEY)]
    .map(asTarget)
    .filter((target): target is EngagementTarget => Boolean(target));
  if (!legacy.length) return remote;

  const alreadyFollowed = new Set(remote.map((row) => `${row.targetType}:${row.targetId}`));
  const missing = legacy.filter((target) => !alreadyFollowed.has(storageKey(target)));
  if (!missing.length) {
    window.localStorage.removeItem(LEGACY_FOLLOWS_KEY);
    return remote;
  }

  const settled = await Promise.allSettled(
    missing.map((target) =>
      api.setFollow({ targetType: target.kind, targetId: target.id, value: true }),
    ),
  );
  // Preserve only entries the API could not accept, such as a listing removed
  // before the member signs in on a new device.
  const failed = missing.filter((_, index) => settled[index]?.status === "rejected");
  if (failed.length) {
    window.localStorage.setItem(LEGACY_FOLLOWS_KEY, JSON.stringify(failed.map(storageKey)));
  } else {
    window.localStorage.removeItem(LEGACY_FOLLOWS_KEY);
  }

  return api.follows();
}

if (typeof window !== "undefined") {
  reloadLocalLikes();
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
    reloadLocalLikes();
    cb();
  };
  window.addEventListener("ayurpass-engagement", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("ayurpass-engagement", handler);
    window.removeEventListener("storage", handler);
  };
}

/** Fetch the signed-in member's follows and migrate legacy browser-only follows once. */
export async function hydrateFollows(userId: string) {
  if (hydratedForUserId === userId) return;
  if (hydrateInFlight) return hydrateInFlight;

  // Do not briefly show the previous account's follows while a new session loads.
  follows = new Set();
  publish();
  hydrateInFlight = (async () => {
    try {
      const remote = await api.follows();
      const merged = await migrateLegacyFollows(remote);
      applyRemoteFollows(merged);
      hydratedForUserId = userId;
    } finally {
      hydrateInFlight = null;
    }
  })();
  return hydrateInFlight;
}

/** Clear account-bound state on sign-out. */
export function clearFollows() {
  follows = new Set();
  hydratedForUserId = null;
  publish();
}

export function isFollowing(target: EngagementTarget): boolean {
  return follows.has(storageKey(target));
}

export function isLiked(target: EngagementTarget): boolean {
  return likes.has(storageKey(target));
}

/** All follows currently loaded for the authenticated member. */
export function listFollows(): EngagementTarget[] {
  return [...follows]
    .map(asTarget)
    .filter((target): target is EngagementTarget => Boolean(target));
}

export function followCount(): number {
  return follows.size;
}

/** Optimistic durable follow update with rollback if the API rejects it. */
export async function toggleFollow(target: EngagementTarget): Promise<boolean> {
  const key = storageKey(target);
  const before = new Set(follows);
  const next = !before.has(key);
  if (next) follows.add(key);
  else follows.delete(key);
  publish();

  try {
    const result = await api.setFollow({
      targetType: target.kind,
      targetId: target.id,
      value: next,
    });
    applyRemoteFollows(result.follows);
    return result.following;
  } catch (error) {
    follows = before;
    publish();
    throw error;
  }
}

export function toggleLike(target: EngagementTarget): boolean {
  const key = storageKey(target);
  if (likes.has(key)) likes.delete(key);
  else likes.add(key);
  writeSet(LIKES_KEY, likes);
  return likes.has(key);
}
