"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

export function useProviderOrders(providerId: string | undefined) {
  return useQuery({
    queryKey: providerId
      ? queryKeys.orders.byProvider(providerId)
      : [...queryKeys.orders.all(), "provider", "none"],
    queryFn: (): Promise<Order[]> => {
      if (!providerId) return Promise.resolve([]);
      return api.ordersByProvider(providerId);
    },
    enabled: Boolean(providerId),
    staleTime: 20_000,
  });
}

export function useInvalidateProviderOrders(providerId: string | undefined) {
  const qc = useQueryClient();
  return () => {
    if (!providerId) return Promise.resolve();
    return qc.invalidateQueries({ queryKey: queryKeys.orders.byProvider(providerId) });
  };
}
