"use client";

import type { WorkDto } from "@/features/works/types/work.types";

function normalizeStatus(status?: string) {
  if (!status) return "Pendente";

  const value = status.toLowerCase();
  if (value.includes("concl")) return "Concluida";
  if (value.includes("exec") || value.includes("andamento")) return "Em andamento";
  if (value.includes("ativo")) return "Ativa";
  if (value.includes("cancel")) return "Cancelada";
  return status;
}

function resolveBadgeClass(status?: string) {
  if (!status) return "badge badge-orange";

  const value = status.toLowerCase();
  if (value.includes("concl")) return "badge badge-green";
  if (value.includes("exec") || value.includes("andamento") || value.includes("ativo")) return "badge badge-blue";
  if (value.includes("cancel")) return "badge badge-red";
  return "badge badge-orange";
}

type WorkStatusBadgeProps = {
  work: Pick<WorkDto, "status">;
};

export function WorkStatusBadge({ work }: WorkStatusBadgeProps) {
  return <span className={resolveBadgeClass(work.status)}>{normalizeStatus(work.status)}</span>;
}
