"use client";

import { DayNightLayout } from "@/components/DayNightLayout";
import { ProtectedPage } from "@/shared/components/auth/ProtectedPage";
import { useAuth } from "@/features/auth/context/AuthContext";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 17) return "Boa tarde";
  return "Boa noite";
}

export function PageShell({
  title,
  subtitle,
  requiredPermission,
  requireActiveWork,
  children,
}: {
  title: string;
  subtitle?: string;
  requiredPermission?: string;
  requireActiveWork?: boolean;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const greeting = getGreeting();

  return (
    <ProtectedPage requiredPermission={requiredPermission} requireActiveWork={requireActiveWork}>
      <DayNightLayout>
        <div className="page-header">
          <h1 className="greeting">{title === "Dashboard" ? `${greeting}, ${user?.fullName ?? "Usuario"}` : title}</h1>
          <p className="greeting-sub">{subtitle ?? "Gerencie suas informacoes com o layout DayNight."}</p>
        </div>
        {children}
      </DayNightLayout>
    </ProtectedPage>
  );
}
