import api from "@/lib/http";
import type { AuthRequest, AuthResponse, RegisterRequest } from "@/features/auth/types/auth.types";

export const authApi = {
  login: async (body: AuthRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", body);
    return response.data;
  },

  register: async (body: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", body);
    return response.data;
  },
};
