"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorkSelector } from "@/features/works/components/WorkSelector";
import { APP_NAV_ITEMS } from "@/shared/config/navigation";
import { usePermissions } from "@/features/works/hooks/usePermissions";
import { useWork } from "@/features/works/context/WorkContext";

export function Sidebar() {
  const pathname = usePathname();
  const { can } = usePermissions();
  const { currentWork } = useWork();

  const isActive = (href: string) => pathname?.startsWith(href);
  const navItems = APP_NAV_ITEMS.filter((item) => {
    if (!can(item.permission)) return false;
    if (item.requireActiveWork && !currentWork) return false;
    return true;
  });

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:flex">
      <div className="mb-6">
        <WorkSelector />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 ${
              isActive(item.href)
                ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-50"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-6 text-xs text-slate-400">Todos os acessos respeitam a obra ativa.</div>
    </aside>
  );
}
