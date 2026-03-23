import api from "@/lib/http";
import type { CreateSupplierInput, SupplierDto, UpdateSupplierInput } from "@/features/suppliers/types/supplier.types";

export const suppliersApi = {
  list: async (): Promise<SupplierDto[]> => {
    const response = await api.get<SupplierDto[]>("/suppliers");
    return response.data;
  },

  create: async (payload: CreateSupplierInput): Promise<SupplierDto> => {
    const response = await api.post<SupplierDto>("/suppliers", payload);
    return response.data;
  },

  update: async (payload: UpdateSupplierInput): Promise<SupplierDto> => {
    const response = await api.put<SupplierDto>(`/suppliers/${payload.id}`, {
      name: payload.name,
      contact: payload.contact,
    });
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};