import { http } from '@/lib/http';

export interface LoginRequest { email: string; password: string; }
export interface AuthResponse { token: string; fullName: string; email: string; }

export const authService = {
  login: (payload: LoginRequest) => http<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: { fullName: string; email: string; password: string; }) =>
    http<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
};
