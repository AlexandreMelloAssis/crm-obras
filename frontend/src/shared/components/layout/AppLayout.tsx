"use client";

import { ReactNode, useMemo } from "react";
import { TopNav } from "@/shared/components/layout/TopNav";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { useWork } from "@/features/works/context/WorkContext";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { currentWork } = useWork();

  const title = useMemo(() => {
    if (!currentWork) return "CRM Obras";
    return `${currentWork.name} • CRM Obras`;
  }, [currentWork]);

  return (
    <div className="min-h-screen bg-primary text-primary">
      <TopNav />
      <div className="flex min-h-[calc(100vh-56px)]">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6" aria-label="Main content">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {currentWork?.address ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{currentWork.address}</p>
              ) : null}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
