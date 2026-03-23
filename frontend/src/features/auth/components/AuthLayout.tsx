"use client";

import { ReactNode, useEffect, useState } from "react";

type ThemeMode = "snow" | "carbon";

export function AuthLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("snow");

  useEffect(() => {
    const dayNightTheme = localStorage.getItem("daynight-theme");
    const legacyTheme = localStorage.getItem("crm-obras:theme");
    if (dayNightTheme === "carbon" || legacyTheme === "dark") {
      document.documentElement.classList.add("carbon");
      document.documentElement.classList.remove("snow");
      setTheme("carbon");
    } else {
      document.documentElement.classList.add("snow");
      document.documentElement.classList.remove("carbon");
      setTheme("snow");
    }
  }, []);

  const applyTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);

    if (nextTheme === "carbon") {
      document.documentElement.classList.add("carbon");
      document.documentElement.classList.remove("snow");
      localStorage.setItem("daynight-theme", "carbon");
      localStorage.setItem("crm-obras:theme", "dark");
      return;
    }

    document.documentElement.classList.add("snow");
    document.documentElement.classList.remove("carbon");
    localStorage.setItem("daynight-theme", "snow");
    localStorage.setItem("crm-obras:theme", "light");
  };

  return (
    <>
      <div className="login-theme-toggle">
        <div className="theme-toggle">
          <button
            type="button"
            className={`theme-btn theme-btn-snow ${theme === "snow" ? "active" : ""}`}
            onClick={() => applyTheme("snow")}
            title="Snow Edition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>
          <button
            type="button"
            className={`theme-btn theme-btn-carbon ${theme === "carbon" ? "active" : ""}`}
            onClick={() => applyTheme("carbon")}
            title="Carbon Edition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <div className="logo-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm8-11l-1 5h2l-1-5zm-4 2h2l1-3h-4l1 3zm8 0h2l1-3h-4l1 3zm-3-4l1-2h2l1 2h-4zm4 4h2l1-3h-4l1 3z" />
                  </svg>
                </div>
                <span>CRM Obras</span>
              </div>
              <h1 className="login-title">Acesse sua conta</h1>
              <p className="login-subtitle">Entre para continuar no painel</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
