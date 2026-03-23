import { useWork } from "@/features/works/context/WorkContext";

export function usePermissions() {
  const { hasPermission, currentWork } = useWork();

  const canInActiveWork = (permission: string) => {
    if (!currentWork) return false;
    return hasPermission(permission);
  };

  return {
    hasPermission,
    can: hasPermission,
    canInActiveWork,
    hasActiveWork: Boolean(currentWork),
  };
}
