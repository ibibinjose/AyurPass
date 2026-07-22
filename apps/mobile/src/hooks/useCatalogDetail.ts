import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "../api";
import type { Offer, Provider, Service } from "../types";

export function useProviderDetail(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.providers.detail(id) : [...queryKeys.providers.all(), "detail", "none"],
    queryFn: async (): Promise<Provider | null> => {
      if (!id) return null;
      try {
        return await api.provider(id);
      } catch {
        return null;
      }
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

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
    staleTime: 30_000,
  });
}

export function useServiceDetail(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.services.detail(id) : [...queryKeys.services.all(), "detail", "none"],
    queryFn: async (): Promise<Service | null> => {
      if (!id) return null;
      try {
        return await api.service(id);
      } catch {
        return null;
      }
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useOffers() {
  return useQuery({
    queryKey: queryKeys.offers.list(),
    queryFn: (): Promise<Offer[]> => api.offers(),
    staleTime: 60_000,
  });
}

export function useCreateBooking(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createBooking,
    onSuccess: async () => {
      if (userId) {
        await qc.invalidateQueries({ queryKey: queryKeys.bookings.byConsumer(userId) });
      }
    },
  });
}

export function usePaymentMode() {
  return useQuery({
    queryKey: queryKeys.payments.mode(),
    queryFn: () => api.paymentMode(),
    staleTime: 120_000,
  });
}
