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

export function useProviderJobs(providerId: string | undefined) {
  return useQuery({
    queryKey: providerId
      ? queryKeys.jobs.byProvider(providerId)
      : [...queryKeys.jobs.all(), "provider", "none"],
    queryFn: async () => {
      if (!providerId) return [];
      return api.providerJobs(providerId);
    },
    enabled: Boolean(providerId),
    staleTime: 30_000,
  });
}

export function useJobs(filters?: { category?: string; employmentType?: string; q?: string }) {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: () => api.jobs(filters),
    staleTime: 30_000,
  });
}

export function useJobDetail(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.jobs.detail(id) : [...queryKeys.jobs.all(), "detail", "none"],
    queryFn: async () => {
      if (!id) return null;
      try {
        return await api.job(id);
      } catch {
        return null;
      }
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useApplyJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      data,
    }: {
      jobId: string;
      data: {
        fullName: string;
        email: string;
        phone?: string;
        coverNote?: string;
        resumeUrl?: string;
        experienceYears?: number;
      };
    }) => api.applyJob(jobId, data),
    onSuccess: async (_, { jobId }) => {
      await qc.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      await qc.invalidateQueries({ queryKey: queryKeys.jobs.myApplications() });
    },
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: queryKeys.jobs.myApplications(),
    queryFn: () => api.myApplications(),
    staleTime: 30_000,
  });
}
