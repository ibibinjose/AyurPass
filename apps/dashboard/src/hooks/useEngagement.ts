"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginUrl } from "@/lib/auth-redirect";
import {
  engagementServerSnapshot,
  engagementSnapshot,
  hydrateFollows,
  isFollowing,
  isLiked,
  subscribeEngagement,
  toggleFollow,
  toggleLike,
  type EngagementTarget,
} from "@/lib/engagement";

/**
 * Follow / like state for a profile. Mutations require a signed-in account;
 * guests are sent to login with a return path.
 */
export function useEngagement(target: EngagementTarget) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Version-only snapshot — stable reference until follow/like data changes.
  useSyncExternalStore(
    subscribeEngagement,
    engagementSnapshot,
    engagementServerSnapshot,
  );

  // Only surface engagement state for signed-in users (no guest follow/like).
  const following = Boolean(user) && isFollowing(target);
  const liked = Boolean(user) && isLiked(target);

  useEffect(() => {
    if (!user?.id) return;
    void hydrateFollows(user.id).catch(() => {
      // A profile remains usable when a follow sync is temporarily unavailable.
    });
  }, [user?.id]);

  const requireAuth = useCallback((): boolean => {
    if (loading) return false;
    if (user) return true;
    const returnTo =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname || "/";
    router.push(loginUrl(returnTo));
    return false;
  }, [loading, user, router, pathname]);

  const onFollow = useCallback(async () => {
    if (!requireAuth()) return false;
    try {
      return await toggleFollow(target);
    } catch {
      return isFollowing(target);
    }
  }, [requireAuth, target]);

  const onLike = useCallback(() => {
    if (!requireAuth()) return false;
    return toggleLike(target);
  }, [requireAuth, target]);

  return { following, liked, onFollow, onLike, canEngage: Boolean(user) };
}
