"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export function useProviderProducts(providerId: string | undefined) {
  return useQuery({
    queryKey: providerId
      ? queryKeys.products.byProvider(providerId)
      : [...queryKeys.products.all(), "provider", "none"],
    queryFn: (): Promise<Product[]> => {
      if (!providerId) return Promise.resolve([]);
      return api.productsByProvider(providerId);
    },
    enabled: Boolean(providerId),
    staleTime: 20_000,
  });
}

export function useInvalidateProviderProducts(providerId: string | undefined) {
  const qc = useQueryClient();
  return () => {
    if (!providerId) return Promise.resolve();
    return qc.invalidateQueries({ queryKey: queryKeys.products.byProvider(providerId) });
  };
}
