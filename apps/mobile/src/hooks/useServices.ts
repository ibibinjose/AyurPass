import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@ayurpass/shared";
import { api } from "../api";
import type { Service, ServiceCategory } from "../types";

export function useServices(category: ServiceCategory | "ALL" = "ALL") {
  const cat = category === "ALL" ? undefined : category;
  return useQuery({
    queryKey: queryKeys.services.list({ category: cat ?? "ALL" }),
    queryFn: (): Promise<Service[]> => api.services(cat),
    staleTime: 30_000,
  });
}
