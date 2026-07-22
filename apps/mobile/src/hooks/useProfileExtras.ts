import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "../api";
import type { HealthProfile, LoyaltySummary } from "../types";

export function useHealthProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? queryKeys.healthProfile(userId) : ["ayurpass", "health-profile", "none"],
    queryFn: async (): Promise<HealthProfile | null> => {
      if (!userId) return null;
      try {
        return await api.healthProfile(userId);
      } catch {
        return null;
      }
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export function useLoyalty(enabled = true) {
  return useQuery({
    queryKey: queryKeys.loyalty(),
    queryFn: async (): Promise<LoyaltySummary | null> => {
      try {
        return await api.loyalty();
      } catch {
        return null;
      }
    },
    enabled,
    staleTime: 60_000,
  });
}
