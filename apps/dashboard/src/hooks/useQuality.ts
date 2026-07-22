"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginUrl } from "@/lib/auth-redirect";
import {
  api,
  ApiError,
  type QualityReview,
  type QualitySummary,
  type QualityTargetType,
} from "@/lib/api";

export type QualityTarget = {
  type: QualityTargetType;
  id: string;
};

/**
 * Server-backed quality controls: star ratings, text reviews, like / dislike.
 * Guests can read aggregates; mutations require sign-in.
 */
export function useQuality(target: QualityTarget | null) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [summary, setSummary] = useState<QualitySummary | null>(null);
  const [reviews, setReviews] = useState<QualityReview[] | null>(null);
  const [loading, setLoading] = useState(Boolean(target));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const targetType = target?.type;
  const targetId = target?.id;
  const myReaction = summary?.myReaction;

  const reload = useCallback(async () => {
    if (!targetId || !targetType) {
      setSummary(null);
      setReviews(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [s, r] = await Promise.all([
        api.qualitySummary(targetType, targetId),
        api.qualityReviews(targetType, targetId, 12),
      ]);
      setSummary(s);
      setReviews(r);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load ratings.";
      // Stale API without quality routes (Cannot GET /quality/…)
      if (/cannot get \/quality/i.test(msg) || /not found/i.test(msg)) {
        setError(
          "Ratings are unavailable — the API may need a restart to load the quality module.",
        );
      } else {
        setError(msg);
      }
      setSummary({
        targetType: targetType,
        targetId: targetId,
        rating: 0,
        reviewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        stars: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
        myReview: null,
        myReaction: null,
      });
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        void reload();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [reload]);

  const requireAuth = useCallback((): boolean => {
    if (authLoading) return false;
    if (user) return true;
    const returnTo =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname || "/";
    router.push(loginUrl(returnTo));
    return false;
  }, [authLoading, user, router, pathname]);

  const setReaction = useCallback(
    async (value: "like" | "dislike" | "none") => {
      if (!targetId || !targetType || !requireAuth()) return null;
      setBusy(true);
      setError(null);
      try {
        // Toggle: same reaction again clears
        const current = myReaction;
        const next =
          value !== "none" && current === value ? "none" : value;
        const s = await api.setReaction({
          targetType: targetType,
          targetId: targetId,
          value: next,
        });
        setSummary(s);
        return s;
      } catch (e) {
        setError(
          e instanceof ApiError || e instanceof Error
            ? e.message
            : "Could not save reaction.",
        );
        return null;
      } finally {
        setBusy(false);
      }
    },
    [targetId, targetType, requireAuth, myReaction],
  );

  const submitReview = useCallback(
    async (data: { rating: number; title?: string; body?: string }) => {
      if (!targetId || !targetType || !requireAuth()) return null;
      setBusy(true);
      setError(null);
      try {
        await api.upsertReview({
          targetType: targetType,
          targetId: targetId,
          rating: data.rating,
          title: data.title,
          body: data.body,
        });
        await reload();
        return true;
      } catch (e) {
        setError(
          e instanceof ApiError || e instanceof Error
            ? e.message
            : "Could not save review.",
        );
        return false;
      } finally {
        setBusy(false);
      }
    },
    [targetId, targetType, requireAuth, reload],
  );

  const removeReview = useCallback(async () => {
    if (!targetId || !targetType || !requireAuth()) return false;
    setBusy(true);
    setError(null);
    try {
      await api.deleteReview(targetType, targetId);
      await reload();
      return true;
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : "Could not remove review.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }, [targetId, targetType, requireAuth, reload]);

  return {
    summary,
    reviews,
    loading,
    busy,
    error,
    canEngage: Boolean(user),
    setReaction,
    submitReview,
    removeReview,
    reload,
  };
}
