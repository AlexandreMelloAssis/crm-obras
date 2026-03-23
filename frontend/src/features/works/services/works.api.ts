import api from "@/lib/http";
import type { WorkDto } from "@/features/works/types/work.types";

export const worksApi = {
  list: async (): Promise<WorkDto[]> => {
    const response = await api.get<WorkDto[]>("/works");
    return response.data;
  },
  getById: async (id: string): Promise<WorkDto> => {
    const response = await api.get<WorkDto>(`/works/${id}`);
    return response.data;
  },
  create: async (payload: { name: string; address: string }): Promise<WorkDto> => {
    const response = await api.post<WorkDto>("/works", payload);
    return response.data;
  },
  update: async (id: string, payload: { name: string; address: string; status?: string }): Promise<WorkDto> => {
    const response = await api.put<WorkDto>(`/works/${id}`, payload);
    return response.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/works/${id}`);
  },
};
