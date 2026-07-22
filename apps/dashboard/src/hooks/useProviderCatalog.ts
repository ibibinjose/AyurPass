"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "@/lib/api";
import type { Professional, Service } from "@/lib/types";

export function useProviderServices(providerId: string | undefined) {
  return useQuery({
    queryKey: providerId
      ? queryKeys.services.byProvider(providerId)
      : [...queryKeys.services.all(), "provider", "none"],
    queryFn: (): Promise<Service[]> => {
      if (!providerId) return Promise.resolve([]);
      return api.servicesByProvider(providerId);
    },
    enabled: Boolean(providerId),
    staleTime: 20_000,
  });
}

export function useProviderTeam(providerId: string | undefined) {
  return useQuery({
    queryKey: providerId
      ? queryKeys.professionals.byProvider(providerId)
      : [...queryKeys.professionals.all(), "provider", "none"],
    queryFn: (): Promise<Professional[]> => {
      if (!providerId) return Promise.resolve([]);
      return api.professionalsByProvider(providerId);
    },
    enabled: Boolean(providerId),
    staleTime: 60_000,
  });
}

export function useInvalidateProviderServices(providerId: string | undefined) {
  const qc = useQueryClient();
  return () => {
    if (!providerId) return Promise.resolve();
    return qc.invalidateQueries({ queryKey: queryKeys.services.byProvider(providerId) });
  };
}

/** Helper mutation wrapper used after create/update/delete service. */
export function useRefreshProviderCatalog(providerId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => true,
    onSuccess: async () => {
      if (!providerId) return;
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.services.byProvider(providerId) }),
        qc.invalidateQueries({ queryKey: queryKeys.professionals.byProvider(providerId) }),
      ]);
    },
  });
}
