"use client";

import { useCallback, useEffect, useState } from "react";
import { pushRecent, readRecent, type RecentItem, type RecentKind } from "@/lib/directory";

export function useRecentViews(limit = 8) {
  const [items, setItems] = useState<RecentItem[]>([]);

  const reload = useCallback(() => {
    setItems(readRecent(limit));
  }, [limit]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) reload();
    };
    run();
    const on = () => {
      if (active) reload();
    };
    window.addEventListener("ayurpass-recent", on);
    window.addEventListener("storage", on);
    return () => {
      active = false;
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
