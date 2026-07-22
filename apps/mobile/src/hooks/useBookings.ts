import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "../api";
import type { Booking } from "../types";

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

export function usePayBooking(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => api.payBooking(bookingId),
    onSuccess: async () => {
      if (userId) {
        await qc.invalidateQueries({ queryKey: queryKeys.bookings.byConsumer(userId) });
      }
    },
  });
}

export function useConfirmBookingPayment(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => api.confirmBookingPayment(bookingId),
    onSuccess: async () => {
      if (userId) {
        await qc.invalidateQueries({ queryKey: queryKeys.bookings.byConsumer(userId) });
      }
    },
  });
}
