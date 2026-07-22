import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "../api";
import type { Provider } from "../types";

export function useProviders(search?: string) {
  const q = search?.trim() || undefined;
  return useQuery({
    queryKey: queryKeys.providers.list({ q: q ?? "" }),
    queryFn: async (): Promise<Provider[]> => api.providers(q ? { q } : undefined),
    staleTime: 30_000,
  });
}
