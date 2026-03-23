import { useMutation, useQueryClient } from "@tanstack/react-query";
import { worksApi } from "@/features/works/services/works.api";
import { useWork } from "@/features/works/context/WorkContext";

type CreateWorkInput = {
  name: string;
  address: string;
};

type UpdateWorkInput = {
  id: string;
  name: string;
  address: string;
  status: string;
};

export function useCreateWork() {
  const queryClient = useQueryClient();
  const { refreshWorks } = useWork();

  return useMutation({
    mutationFn: (payload: CreateWorkInput) => worksApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        refreshWorks(),
        queryClient.invalidateQueries({ queryKey: ["works"] }),
      ]);
    },
  });
}

export function useUpdateWork() {
  const queryClient = useQueryClient();
  const { refreshWorks } = useWork();

  return useMutation({
    mutationFn: (payload: UpdateWorkInput) =>
      worksApi.update(payload.id, {
        name: payload.name,
        address: payload.address,
        status: payload.status,
      }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        refreshWorks(),
        queryClient.invalidateQueries({ queryKey: ["works"] }),
        queryClient.invalidateQueries({ queryKey: ["works", "detail", variables.id] }),
      ]);
    },
  });
}

export function useDeleteWork() {
  const queryClient = useQueryClient();
  const { refreshWorks } = useWork();

  return useMutation({
    mutationFn: (id: string) => worksApi.remove(id),
    onSuccess: async () => {
      await Promise.all([
        refreshWorks(),
        queryClient.invalidateQueries({ queryKey: ["works"] }),
      ]);
    },
  });
}
