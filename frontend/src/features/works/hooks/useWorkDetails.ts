import { useQuery } from "@tanstack/react-query";
import { worksApi } from "@/features/works/services/works.api";
import type { WorkDto } from "@/features/works/types/work.types";
import { useAuth } from "@/features/auth/context/AuthContext";

export function useWorkDetails(workId?: string) {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery<WorkDto>({
    queryKey: ["works", "detail", workId],
    queryFn: () => worksApi.getById(workId as string),
    enabled: Boolean(workId) && isAuthenticated && !isLoading,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}
