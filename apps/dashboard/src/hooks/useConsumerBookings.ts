"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";

export function useConsumerBookings(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? queryKeys.bookings.byConsumer(userId) : queryKeys.bookings.mine(),
    queryFn: (): Promise<Booking[]> => {
      if (!userId) return Promise.resolve([]);
      return api.bookingsByConsumer(userId);
    },
    enabled: Boolean(userId),
    staleTime: 20_000,
  });
}

export function useInvalidateConsumerBookings(userId: string | undefined) {
  const qc = useQueryClient();
  return () => {
    if (!userId) return Promise.resolve();
    return qc.invalidateQueries({ queryKey: queryKeys.bookings.byConsumer(userId) });
  };
}

export function useCancelBooking(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      await api.updateBooking(bookingId, { status: "CANCELLED" });
    },
    onSuccess: async () => {
      if (userId) {
        await qc.invalidateQueries({ queryKey: queryKeys.bookings.byConsumer(userId) });
      }
    },
  });
}
