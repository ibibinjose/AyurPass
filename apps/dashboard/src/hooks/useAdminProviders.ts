"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "@/lib/api";
import type { AdminProvider } from "@/lib/types";

const adminProvidersKey = [...queryKeys.all, "admin", "providers"] as const;

export function useAdminProviders(enabled = true) {
  return useQuery({
    queryKey: adminProvidersKey,
    queryFn: (): Promise<AdminProvider[]> => api.adminProviders(),
    enabled,
    staleTime: 20_000,
  });
}

export function useSetProviderVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      providerId,
      status,
    }: {
      providerId: string;
      status: "verified" | "rejected" | "pending";
    }) => api.adminSetVerification(providerId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminProvidersKey });
      void qc.invalidateQueries({ queryKey: queryKeys.admin.overview() });
    },
  });
}
