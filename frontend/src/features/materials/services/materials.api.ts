import api from "@/lib/http";
import type { CreateMaterialInput, MaterialDto } from "@/features/materials/types/material.types";

export const materialsApi = {
  list: async (): Promise<MaterialDto[]> => {
    const response = await api.get<MaterialDto[]>("/materials");
    return response.data;
  },

  create: async (payload: CreateMaterialInput): Promise<string> => {
    const response = await api.post<string>("/materials", payload);
    return response.data;
  },
};
