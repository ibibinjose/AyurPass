"use client";

import { useCallback, useEffect, useState } from "react";
import { pushRecent, readRecent, type RecentItem, type RecentKind } from "@/lib/directory";

export function useRecentViews(limit = 8) {
  const [items, setItems] = useState<RecentItem[]>([]);

  const reload = useCallback(() => {
    setItems(readRecent(limit));
  }, [limit]);

  useEffect(() => {
    reload();
    const on = () => reload();
    window.addEventListener("ayurpass-recent", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("ayurpass-recent", on);
      window.removeEventListener("storage", on);
    };
  }, [reload]);

  return items;
}

export function trackRecentView(item: {
  kind: RecentKind;
  id: string;
  title: string;
  href: string;
  subtitle?: string;
}) {
  pushRecent(item);
}
