import api from "@/lib/http";
import type { CreateStageInput } from "@/features/stages/types/stage.types";

export const stagesApi = {
  create: async (payload: CreateStageInput): Promise<string> => {
    const response = await api.post<string>("/project-stages", payload);
    return response.data;
  },
};
