import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { materialsApi } from "@/features/materials/services/materials.api";
import type { CreateMaterialInput } from "@/features/materials/types/material.types";
import { useAuth } from "@/features/auth/context/AuthContext";

const MATERIALS_QUERY_KEY = ["materials"];

export function useMaterials() {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: MATERIALS_QUERY_KEY,
    queryFn: materialsApi.list,
    enabled: isAuthenticated && !isLoading,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMaterialInput) => materialsApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MATERIALS_QUERY_KEY });
    },
  });
}
