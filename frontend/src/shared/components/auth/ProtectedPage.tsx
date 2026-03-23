"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { usePermissions } from "@/features/works/hooks/usePermissions";
import { useWork } from "@/features/works/context/WorkContext";
import { LoadingState } from "@/shared/components/common/LoadingState";
import { PermissionDeniedState } from "@/shared/components/common/PermissionDeniedState";
import { EmptyState } from "@/shared/components/common/EmptyState";

type ProtectedPageProps = {
  children: React.ReactNode;
  requiredPermission?: string;
  requireActiveWork?: boolean;
};

export function ProtectedPage({
  children,
  requiredPermission,
  requireActiveWork = false,
}: ProtectedPageProps) {
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();
  const { can } = usePermissions();
  const { currentWork } = useWork();

  useEffect(() => {
    if (isLoading || isAuthenticated || typeof window === "undefined") {
      return;
    }

    const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    window.location.href = `/login${next}`;
  }, [isLoading, isAuthenticated, pathname]);

  if (isLoading) {
    return <LoadingState title="Carregando sessao" description="Estamos validando sua autenticacao." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredPermission && !can(requiredPermission)) {
    return <PermissionDeniedState />;
  }

  if (requireActiveWork && !currentWork) {
    return (
      <EmptyState
        title="Nenhuma obra ativa"
        description="Selecione uma obra ativa para continuar nesta tela."
      />
    );
  }

  return <>{children}</>;
}
