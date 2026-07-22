import { useQuery } from "@tanstack/react-query";
import { endpoints, queryKeys } from "@ayurpass/shared";
import { API_URL } from "../api";

type HealthResponse = {
  status: string;
  timestamp: string;
  service?: string;
  version?: string;
};

async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}${endpoints.health}`);
  if (!res.ok) throw new Error(`Health check failed (${res.status})`);
  return res.json() as Promise<HealthResponse>;
}

/** Platform health — example TanStack Query hook for mobile. */
export function useApiHealth(enabled = true) {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: fetchHealth,
    enabled,
    staleTime: 15_000,
  });
}
