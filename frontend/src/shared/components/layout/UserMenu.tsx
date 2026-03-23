"use client";

import { useMemo, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (!user) return "Usuário";
    return user.fullName || user.email;
  }, [user]);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
          <User size={16} />
        </span>
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown size={16} className={open ? "rotate-180" : ""} />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
