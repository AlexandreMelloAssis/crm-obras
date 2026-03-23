import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { suppliersApi } from "@/features/suppliers/services/suppliers.api";
import type { CreateSupplierInput, UpdateSupplierInput } from "@/features/suppliers/types/supplier.types";
import { useAuth } from "@/features/auth/context/AuthContext";

const SUPPLIERS_QUERY_KEY = ["suppliers"];

export function useSuppliers() {
  const { isAuthenticated, isLoading } = useAuth();

  return useQuery({
    queryKey: SUPPLIERS_QUERY_KEY,
    queryFn: suppliersApi.list,
    enabled: isAuthenticated && !isLoading,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSupplierInput) => suppliersApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSupplierInput) => suppliersApi.update(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY });
    },
  });
}