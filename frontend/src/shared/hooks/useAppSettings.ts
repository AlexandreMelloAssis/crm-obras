"use client";

import { useEffect, useState } from "react";

export const APP_SETTINGS_KEY = "crm-obras:settings-local";

export type AppSettings = {
  compactCards: boolean;
  autoRefreshDashboard: boolean;
  enableOperationAlerts: boolean;
  defaultLandingPage: "/dashboard" | "/obras" | "/relatorios";
  preferredWorkModule: "/custos" | "/documentos" | "/etapas" | "/cotacoes";
};

export const defaultAppSettings: AppSettings = {
  compactCards: false,
  autoRefreshDashboard: true,
  enableOperationAlerts: true,
  defaultLandingPage: "/dashboard",
  preferredWorkModule: "/custos",
};

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaultAppSettings;

  const raw = window.localStorage.getItem(APP_SETTINGS_KEY);
  if (!raw) return defaultAppSettings;

  try {
    return { ...defaultAppSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return defaultAppSettings;
  }
}

function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setIsReady(true);
  }, []);

  const setSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  };

  return {
    settings,
    setSetting,
    isReady,
  };
}
