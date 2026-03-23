"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/features/auth/services/auth.api";
import { usersApi } from "@/features/users/services/users.api";
import type { AuthResponse, AuthRequest, RegisterRequest, AuthUser } from "@/features/auth/types/auth.types";
import { setToken, clearToken, getToken } from "@/shared/utils/authToken";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((auth: AuthResponse) => {
    setToken(auth.token);
    setUser({ email: auth.email, fullName: auth.fullName });
  }, []);

  const clearSession = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const login = useCallback(async (data: AuthRequest) => {
    setIsLoading(true);
    try {
      const auth = await authApi.login(data);
      setSession(auth);
    } finally {
      setIsLoading(false);
    }
  }, [setSession]);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const auth = await authApi.register(data);
      setSession(auth);
    } finally {
      setIsLoading(false);
    }
  }, [setSession]);

  const logout = useCallback(() => {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, [clearSession]);

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      const token = getToken();
      if (!token) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await usersApi.me();
        if (!mounted) return;

        setUser({
          email: currentUser.email,
          fullName: currentUser.fullName ?? currentUser.name ?? currentUser.email,
        });
      } catch {
        if (!mounted) return;
        clearSession();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();

    return () => {
      mounted = false;
    };
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}