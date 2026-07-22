"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "@/lib/api";
import type { Enquiry } from "@/lib/types";

export function useMyEnquiries(enabled = true) {
  return useQuery({
    queryKey: queryKeys.enquiries.mine(),
    queryFn: (): Promise<Enquiry[]> => api.myEnquiries(),
    enabled,
    staleTime: 15_000,
  });
}

export function useUpdateEnquiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Enquiry["status"] }) =>
      api.updateEnquiry(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: queryKeys.enquiries.mine() });
      const previous = qc.getQueryData<Enquiry[]>(queryKeys.enquiries.mine());
      qc.setQueryData<Enquiry[]>(queryKeys.enquiries.mine(), (old) =>
        old?.map((e) => (e.id === id ? { ...e, status } : e)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queryKeys.enquiries.mine(), ctx.previous);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.enquiries.mine() });
    },
  });
}
