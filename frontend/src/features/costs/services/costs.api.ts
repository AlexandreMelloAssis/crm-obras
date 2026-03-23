import api from "@/lib/http";
import type { CostSummaryDto, CreateCostInput } from "@/features/costs/types/cost.types";

export const costsApi = {
  create: async (payload: CreateCostInput): Promise<string> => {
    const response = await api.post<string>("/costs", payload);
    return response.data;
  },

  getSummary: async (workId: string): Promise<CostSummaryDto> => {
    const response = await api.get<CostSummaryDto>(`/costs/${workId}/summary`);
    return response.data;
  },
};