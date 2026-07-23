"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "@/lib/api";
import type { StaffMember } from "@/lib/types";

/** Normalize API payload so a non-array body never crashes list UI. */
function asStaffList(data: unknown): StaffMember[] {
  if (Array.isArray(data)) return data as StaffMember[];
  return [];
}

export function useProviderStaff(providerId: string | undefined) {
  return useQuery({
    queryKey: providerId
      ? queryKeys.staff.byProvider(providerId)
      : [...queryKeys.staff.all(), "provider", "none"],
    queryFn: async (): Promise<StaffMember[]> => {
      if (!providerId) return [];
      const data = await api.listStaff(providerId);
      // Legacy API bug returned { error, statusCode } with HTTP 200 — reject that shape
      if (data && typeof data === "object" && !Array.isArray(data) && "error" in (data as object)) {
        const err = data as { error?: string; statusCode?: number };
        throw new Error(err.error || "Unable to load staff");
      }
      return asStaffList(data);
    },
    enabled: Boolean(providerId),
    staleTime: 30_000,
  });
}

export function useInvalidateProviderStaff(providerId: string | undefined) {
  const qc = useQueryClient();
  return () => {
    if (!providerId) return Promise.resolve();
    return qc.invalidateQueries({ queryKey: queryKeys.staff.byProvider(providerId) });
  };
}
