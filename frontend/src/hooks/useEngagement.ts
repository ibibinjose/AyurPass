"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  engagementServerSnapshot,
  engagementSnapshot,
  isFollowing,
  isLiked,
  subscribeEngagement,
  toggleFollow,
  toggleLike,
  type EngagementTarget,
} from "@/lib/engagement";

export function useEngagement(target: EngagementTarget) {
  // Version-only snapshot — stable reference until follow/like data changes.
  useSyncExternalStore(
    subscribeEngagement,
    engagementSnapshot,
    engagementServerSnapshot,
  );

  const following = isFollowing(target);
  const liked = isLiked(target);

  const onFollow = useCallback(() => toggleFollow(target), [target.kind, target.id]);
  const onLike = useCallback(() => toggleLike(target), [target.kind, target.id]);

  return { following, liked, onFollow, onLike };
}