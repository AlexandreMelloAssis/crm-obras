"use client";

import { useMemo } from "react";
import { useTheme } from "@/shared/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import { UserMenu } from "@/shared/components/layout/UserMenu";
import { WorkSelector } from "@/features/works/components/WorkSelector";
import { useWork } from "@/features/works/context/WorkContext";

export function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const { works } = useWork();

  const icon = useMemo(() => (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />), [theme]);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b border-slate-200/60 bg-white/70 px-4 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/60">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">CRM Obras</span>
      </div>

      <div className="flex items-center gap-2">
        {works.length > 0 ? (
          <div className="hidden min-w-64 lg:block">
            <WorkSelector />
          </div>
        ) : null}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Toggle theme"
        >
          {icon}
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
