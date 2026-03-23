"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { worksApi } from "@/features/works/services/works.api";
import { STORAGE_KEYS } from "@/lib/constants";
import type { WorkDto } from "@/features/works/types/work.types";
import { getToken } from "@/shared/utils/authToken";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useNotifications } from "@/providers/NotificationProvider";
import { parseApiError } from "@/shared/utils/apiError";

type WorkContextValue = {
  works: WorkDto[];
  currentWork: WorkDto | null;
  isLoading: boolean;
  loadError: string | null;
  setCurrentWork: (workId: string) => void;
  refreshWorks: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const WorkContext = createContext<WorkContextValue | null>(null);

export function WorkProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { notify } = useNotifications();
  const [works, setWorks] = useState<WorkDto[]>([]);
  const [currentWork, setCurrentWorkState] = useState<WorkDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadWorks = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setWorks([]);
      setCurrentWorkState(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await worksApi.list();
      setWorks(data);
      setLoadError(null);

      if (data.length) {
        const storedWorkId = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEYS.CURRENT_WORK) : null;
        const found = data.find((w) => w.id === storedWorkId);
        setCurrentWorkState(found ?? data[0]);
      } else {
        setCurrentWorkState(null);
      }
    } catch (error) {
      setWorks([]);
      setCurrentWorkState(null);

      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status !== 401) {
        const message = parseApiError(error, "Nao foi possivel carregar as obras disponiveis.");
        setLoadError(message);
        console.error("Failed to load works", error);
        notify({
          title: "Falha ao carregar obras",
          message,
          tone: "error",
        });
      } else {
        setLoadError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  const setCurrentWork = useCallback((workId: string) => {
    const found = works.find((w) => w.id === workId);
    if (!found) return;
    setCurrentWorkState(found);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.CURRENT_WORK, found.id);
    }
  }, [works]);

  const refreshWorks = useCallback(async () => {
    if (!isAuthenticated) return;
    await loadWorks();
  }, [isAuthenticated, loadWorks]);

  const hasPermission = useCallback((permission: string) => {
    if (!isAuthenticated) return false;

    const normalized = permission.toLowerCase();
    const identity = `${user?.email ?? ""} ${user?.fullName ?? ""}`.toLowerCase();
    const isAdmin = identity.includes("admin");

    if (normalized.includes("view")) return true;
    if (normalized.startsWith("dashboard.")) return true;
    if (normalized.startsWith("works.select")) return true;

    // Until backend exposes per-work permissions endpoint, keep management actions restricted.
    if (
      normalized.startsWith("users.manage") ||
      normalized.startsWith("works.manage") ||
      normalized.startsWith("suppliers.manage") ||
      normalized.startsWith("costs.manage") ||
      normalized.startsWith("documents.manage") ||
      normalized.startsWith("quotations.manage")
    ) {
      return isAdmin;
    }

    return isAdmin;
  }, [isAuthenticated, user?.email, user?.fullName]);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setWorks([]);
      setCurrentWorkState(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    void loadWorks();
  }, [isAuthLoading, isAuthenticated, loadWorks]);

  const value = useMemo(
    () => ({ works, currentWork, isLoading, loadError, setCurrentWork, refreshWorks, hasPermission }),
    [works, currentWork, isLoading, loadError, setCurrentWork, refreshWorks, hasPermission]
  );

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
}

export function useWork() {
  const context = useContext(WorkContext);
  if (!context) {
    throw new Error("useWork must be used within WorkProvider");
  }
  return context;
}
