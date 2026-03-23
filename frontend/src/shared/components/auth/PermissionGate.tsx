"use client";

import { usePermissions } from "@/features/works/hooks/usePermissions";

type PermissionGateProps = {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}