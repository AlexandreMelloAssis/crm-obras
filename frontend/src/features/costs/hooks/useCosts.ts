import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { costsApi } from "@/features/costs/services/costs.api";
import type { CreateCostInput } from "@/features/costs/types/cost.types";
import { useAuth } from "@/features/auth/context/AuthContext";

function summaryKey(workId?: string) {
  return ["costs", "summary", workId] as const;
}

export function useCostSummary(workId?: string) {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: summaryKey(workId),
    queryFn: () => costsApi.getSummary(workId as string),
    enabled: Boolean(workId) && isAuthenticated && !isLoading,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateCost(workId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCostInput) => costsApi.create(payload),
    onSuccess: async () => {
      if (workId) {
        await queryClient.invalidateQueries({ queryKey: summaryKey(workId) });
      }
    },
  });
}