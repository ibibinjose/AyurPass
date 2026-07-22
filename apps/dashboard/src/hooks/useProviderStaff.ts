"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "@/lib/api";
import type { StaffMember } from "@/lib/types";

export function useProviderStaff(providerId: string | undefined) {
  return useQuery({
    queryKey: providerId
      ? queryKeys.staff.byProvider(providerId)
      : [...queryKeys.staff.all(), "provider", "none"],
    queryFn: (): Promise<StaffMember[]> => {
      if (!providerId) return Promise.resolve([]);
      return api.listStaff(providerId);
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
