import api from "@/lib/http";
import type { CreateUserInput, CurrentUserDto, UserDto } from "@/features/users/types/user.types";

export const usersApi = {
  me: async (): Promise<CurrentUserDto> => {
    const response = await api.get<CurrentUserDto>("/users/me");
    return response.data;
  },

  list: async (): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>("/users");
    return response.data;
  },

  getById: async (id: string): Promise<UserDto> => {
    const response = await api.get<UserDto>(`/users/${id}`);
    return response.data;
  },

  update: async (payload: { id: string; fullName: string; isActive: boolean }): Promise<UserDto> => {
    const response = await api.put<UserDto>(`/users/${payload.id}`, {
      id: payload.id,
      fullName: payload.fullName,
      isActive: payload.isActive,
    });
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  create: async (payload: CreateUserInput): Promise<UserDto> => {
    await api.post("/auth/register", {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
    });

    const users = await usersApi.list();
    const createdUser = users.find((item) => item.email.toLowerCase() === payload.email.toLowerCase());

    if (!createdUser) {
      throw new Error("Usuario criado, mas nao foi possivel confirmar o cadastro na listagem.");
    }

    return createdUser;
  },
};
