/** Shared report / suggestion config — keep in sync with backend quality.dto.ts */

export type FeedbackKind = "abuse" | "suggestion";

export type FeedbackStatus = "open" | "reviewing" | "resolved" | "dismissed";

export const ABUSE_OPTIONS = [
  { id: "spam", label: "Spam or advertising" },
  { id: "harassment", label: "Harassment or hate" },
  { id: "fake", label: "Fake or misleading listing" },
  { id: "safety", label: "Safety or health concern" },
  { id: "scam", label: "Scam or fraud" },
  { id: "copyright", label: "Copyright / trademark" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "other", label: "Other" },
] as const;

export const SUGGESTION_OPTIONS = [
  { id: "feature", label: "New feature idea" },
  { id: "improvement", label: "Improve something existing" },
  { id: "content", label: "Content or listings" },
  { id: "ux", label: "Design or usability" },
  { id: "bug", label: "Bug or technical issue" },
  { id: "other", label: "Other" },
] as const;

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export function feedbackCategoryLabel(kind: string, category: string): string {
  const list = kind === "suggestion" ? SUGGESTION_OPTIONS : ABUSE_OPTIONS;
  return list.find((o) => o.id === category)?.label ?? category;
}

export const FEEDBACK_MIN_MESSAGE = 10;
export const FEEDBACK_MAX_MESSAGE = 4000;
