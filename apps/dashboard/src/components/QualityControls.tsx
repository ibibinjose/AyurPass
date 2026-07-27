"use client";

import { useEffect, useState } from "react";
import { Heart, Star, ThumbsDown } from "lucide-react";
import { useQuality, type QualityTarget } from "@/hooks/useQuality";
import { Button, ErrorNote, Field, Textarea } from "@/components/ui";
import { ReportSuggestTrigger } from "@/components/ReportSuggestModal";

function StarIcon({
  filled,
  className = "h-5 w-5",
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <Star
      className={className}
      strokeWidth={1.75}
      fill={filled ? "currentColor" : "none"}
      aria-hidden
    />
  );
}

/** Compact star display (read-only). */
export function StarRating({
  value,
  count,
  size = "sm",
  /** Single star + number — denser for card footers */
  compact,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  compact?: boolean;
}) {
  const v = Math.round(Number(value) * 10) / 10;
  const starClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  if (compact) {
    return (
      <span
        className="inline-flex h-9 items-center gap-1 rounded-full border border-hairline bg-gold-soft/50 px-2.5 text-gold shadow-[0_1px_0_rgba(36,56,46,0.04)]"
        title={`${v > 0 ? v.toFixed(1) : "No"} rating${count ? ` · ${count} reviews` : ""}`}
      >
        <Star
          className="h-4 w-4 shrink-0"
          strokeWidth={2}
          fill="currentColor"
          aria-hidden
        />
        <span className="text-xs font-bold tabular-nums text-forest">
          {v > 0 ? v.toFixed(1) : "—"}
        </span>
        {count != null && count > 0 ? (
          <span className="text-[10px] font-semibold text-ink-muted">({count})</span>
        ) : null}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-gold" title={`${v} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < Math.round(v)} className={starClass} />
      ))}
      <span className="ml-0.5 text-xs font-semibold tabular-nums text-ink-secondary">
        {v > 0 ? v.toFixed(1) : "—"}
        {count != null && count > 0 ? (
          <span className="font-medium text-ink-muted"> ({count})</span>
        ) : null}
      </span>
    </span>
  );
}

/** Like / dislike toggle with live counts. */
export function LikeDislikeBar({
  target,
  compact,
  initialAction,
}: {
  target: QualityTarget;
  compact?: boolean;
  /** Fire this reaction once summary has loaded (card strip activation). */
  initialAction?: "like" | "dislike";
}) {
  const { summary, busy, setReaction, canEngage, loading } = useQuality(target);
  const likes = summary?.likeCount ?? 0;
  const dislikes = summary?.dislikeCount ?? 0;
  const mine = summary?.myReaction;
  const [armed, setArmed] = useState(Boolean(initialAction));

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      if (!armed || !initialAction || loading || !summary) return;
      setArmed(false);
      if (summary.myReaction !== initialAction) {
        void setReaction(initialAction);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [armed, initialAction, loading, summary, setReaction]);

  const btn = (active: boolean, danger?: boolean) =>
    compact
      ? `inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-bold tabular-nums transition-colors ${
          active
            ? danger
              ? "border-red-200 bg-red-600 text-white shadow-xs"
              : "border-forest bg-forest text-white shadow-xs"
            : "border-hairline bg-surface text-ink-secondary hover:border-leaf hover:bg-clay/50 hover:text-forest"
        }`
      : `inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors ${
          active
            ? danger
              ? "bg-red-600 text-white ring-1 ring-red-700"
              : "bg-forest text-white ring-1 ring-forest-deep"
            : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
        }`;

  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-1.5" : "mt-1 gap-2"}`}>
      <button
        type="button"
        disabled={busy}
        title={canEngage ? "Helpful / like" : "Sign in to like"}
        aria-label={canEngage ? `Like${likes ? ` (${likes})` : ""}` : "Sign in to like"}
        aria-pressed={mine === "like"}
        onClick={() => void setReaction("like")}
        className={btn(mine === "like")}
      >
        <Heart
          className="h-4 w-4 shrink-0"
          strokeWidth={2}
          fill={mine === "like" ? "currentColor" : "none"}
          aria-hidden
        />
        {compact ? (likes > 0 ? likes : null) : likes}
        {!compact ? <span className="hidden sm:inline">Like</span> : null}
      </button>
      <button
        type="button"
        disabled={busy}
        title={canEngage ? "Not recommended" : "Sign in to dislike"}
        aria-label={canEngage ? `Dislike${dislikes ? ` (${dislikes})` : ""}` : "Sign in to dislike"}
        aria-pressed={mine === "dislike"}
        onClick={() => void setReaction("dislike")}
        className={btn(mine === "dislike", true)}
      >
        <ThumbsDown
          className="h-4 w-4 shrink-0"
          strokeWidth={2}
          fill={mine === "dislike" ? "currentColor" : "none"}
          aria-hidden
        />
        {compact ? (dislikes > 0 ? dislikes : null) : dislikes}
        {!compact ? <span className="hidden sm:inline">Dislike</span> : null}
      </button>
    </div>
  );
}

/** Full quality panel: summary, like/dislike, write review, list reviews. */
export function QualityPanel({
  target,
  title = "Ratings & reviews",
  targetLabel,
}: {
  target: QualityTarget;
  title?: string;
  /** Display name for abuse reports about this listing */
  targetLabel?: string;
}) {
  const {
    summary,
    reviews,
    loading,
    busy,
    error,
    canEngage,
    setReaction,
    submitReview,
    removeReview,
  } = useQuality(target);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const myReview = summary?.myReview;
  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      if (myReview) {
        setRating(myReview.rating);
        setBody(myReview.body ?? "");
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [myReview]);

  const avg = summary?.rating ?? 0;
  const count = summary?.reviewCount ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">{title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StarRating value={avg} count={count} size="md" />
            {loading ? (
              <span className="text-xs font-medium text-ink-muted">Loading…</span>
            ) : null}
          </div>
          {count > 0 && summary?.stars ? (
            <div className="mt-3 space-y-1">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = summary.stars[String(n)] ?? 0;
                const pct = count ? Math.round((c / count) * 100) : 0;
                return (
                  <div key={n} className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
                    <span className="w-3 tabular-nums">{n}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-clay">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right tabular-nums">{c}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
        <LikeDislikeBar target={target} />
      </div>

      <ErrorNote message={error} />

      <div className="rounded-2xl border border-hairline bg-clay/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-forest">
            {summary?.myReview ? "Your review" : "Rate this listing"}
          </p>
          {!formOpen ? (
            <Button
              type="button"
              variant="soft"
              className="!min-h-9 !text-xs"
              onClick={() => {
                if (!canEngage) {
                  void setReaction("like"); // triggers login redirect via requireAuth path on mutate
                  setFormOpen(true);
                  return;
                }
                setFormOpen(true);
              }}
            >
              {summary?.myReview ? "Edit review" : "Write a review"}
            </Button>
          ) : null}
        </div>

        {formOpen ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (rating < 1) return;
              void submitReview({ rating, body: body.trim() || undefined }).then((ok) => {
                if (ok) setFormOpen(false);
              });
            }}
          >
            <div>
              <p className="mb-1.5 text-xs font-semibold text-ink-muted">Your rating</p>
              <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className={`rounded-lg p-1 transition-colors ${
                      n <= (hover || rating) ? "text-gold" : "text-ink-muted/40"
                    }`}
                  >
                    <StarIcon filled={n <= (hover || rating)} className="h-7 w-7" />
                  </button>
                ))}
              </div>
            </div>
            <Field label="Review" optional hint="Optional — help others choose quality care.">
              <Textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What stood out? Professionalism, results, atmosphere…"
                maxLength={2000}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy || rating < 1}>
                {busy ? "Saving…" : summary?.myReview ? "Update review" : "Submit review"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              {summary?.myReview ? (
                <Button
                  type="button"
                  variant="danger"
                  disabled={busy}
                  onClick={() => void removeReview().then((ok) => ok && setFormOpen(false))}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            {!canEngage ? (
              <p className="text-xs font-medium text-ink-muted">Sign in to publish your review.</p>
            ) : null}
          </form>
        ) : summary?.myReview ? (
          <div className="mt-3">
            <StarRating value={summary.myReview.rating} size="sm" />
            {summary.myReview.body ? (
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {summary.myReview.body}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs font-medium text-ink-muted">
            Quality feedback helps seekers find trusted practices.
          </p>
        )}
      </div>

      {reviews && reviews.length > 0 ? (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-hairline bg-surface px-4 py-3.5 shadow-[0_1px_0_rgba(36,56,46,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-clay text-xs font-bold text-forest">
                    {r.author?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.author.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (r.author?.fullName ?? "A").slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {r.author?.fullName ?? "AyurPass member"}
                    </p>
                    <p className="text-[11px] font-medium text-ink-muted">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StarRating value={r.rating} size="sm" />
              </div>
              {r.title ? (
                <p className="mt-2 text-sm font-semibold text-forest">{r.title}</p>
              ) : null}
              {r.body ? (
                <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{r.body}</p>
              ) : null}
              <div className="mt-2">
                <ReportSuggestTrigger
                  targetType="review"
                  targetId={r.id}
                  targetLabel={`Review by ${r.author?.fullName ?? "member"}`}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : !loading ? (
        <p className="text-center text-sm font-medium text-ink-muted">
          No reviews yet — be the first to rate.
        </p>
      ) : null}

      <div className="border-t border-hairline pt-4">
        <ReportSuggestTrigger
          targetType={target.type}
          targetId={target.id}
          targetLabel={targetLabel}
        />
      </div>
    </div>
  );
}

/** Inline strip for cards: stars (denormalized) + like/dislike (loads on first click). */
export function QualityCardStrip({
  target,
  rating,
  reviewCount,
  likeCount,
  dislikeCount,
  /** Icon-only row — for dense catalog cards (explore, shop). */
  dense,
  className = "",
}: {
  target: QualityTarget;
  rating?: number | string | null;
  reviewCount?: number | null;
  likeCount?: number | null;
  dislikeCount?: number | null;
  dense?: boolean;
  className?: string;
}) {
  const [live, setLive] = useState<"like" | "dislike" | null>(null);

  const denseBtn =
    "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-hairline bg-surface px-2.5 text-xs font-bold tabular-nums text-ink-secondary shadow-[0_1px_0_rgba(36,56,46,0.04)] transition-colors hover:border-leaf hover:bg-clay/40 hover:text-forest active:scale-[0.97]";

  return (
    <div
      className={
        dense
          ? `inline-flex items-center gap-1.5 ${className}`
          : `mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline/70 pt-3 ${className}`
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <StarRating
        value={Number(rating ?? 0)}
        count={reviewCount ?? undefined}
        compact={dense}
      />
      {live ? (
        <LikeDislikeBar target={target} compact initialAction={live} />
      ) : dense ? (
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            className={denseBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLive("like");
            }}
            title="Like"
            aria-label="Like"
          >
            <Heart className="h-4 w-4" strokeWidth={2} aria-hidden />
            {likeCount != null && likeCount > 0 ? (
              <span className="min-w-[0.75rem]">{likeCount}</span>
            ) : null}
          </button>
          <button
            type="button"
            className={denseBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLive("dislike");
            }}
            title="Not recommended"
            aria-label="Dislike"
          >
            <ThumbsDown className="h-4 w-4" strokeWidth={2} aria-hidden />
            {dislikeCount != null && dislikeCount > 0 ? (
              <span className="min-w-[0.75rem]">{dislikeCount}</span>
            ) : null}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 text-xs font-semibold text-ink-secondary hover:border-leaf hover:text-forest"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLive("like");
            }}
            title="Like or dislike for quality control"
          >
            <Heart className="h-4 w-4" strokeWidth={2} aria-hidden />
            {likeCount != null && likeCount > 0 ? likeCount : "Like"}
          </button>
          <button
            type="button"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 text-xs font-semibold text-ink-secondary hover:border-leaf hover:text-forest"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLive("dislike");
            }}
            title="Not recommended"
            aria-label="Dislike"
          >
            <ThumbsDown className="h-4 w-4" strokeWidth={2} aria-hidden />
            {dislikeCount != null && dislikeCount > 0 ? dislikeCount : "Dislike"}
          </button>
        </div>
      )}
    </div>
  );
}
