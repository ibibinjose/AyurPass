"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";

export function useAdminOverview(enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.overview(),
    queryFn: (): Promise<AdminOverview> => api.adminOverview(),
    enabled,
    staleTime: 30_000,
  });
}
