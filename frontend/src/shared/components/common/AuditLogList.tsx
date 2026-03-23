"use client";

import type { AuditEvent } from "@/shared/utils/auditLog";

function levelClass(level: AuditEvent["level"]) {
  if (level === "success") return "badge badge-green";
  if (level === "warning") return "badge badge-orange";
  if (level === "error") return "badge badge-red";
  return "badge badge-blue";
}

type AuditLogListProps = {
  items: AuditEvent[];
};

export function AuditLogList({ items }: AuditLogListProps) {
  if (items.length === 0) {
    return <p>Nenhum evento registrado.</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Acao</th>
            <th>Entidade</th>
            <th>Nivel</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.at).toLocaleString("pt-BR")}</td>
              <td>{item.action}</td>
              <td>{item.entity}</td>
              <td>
                <span className={levelClass(item.level)}>{item.level}</span>
              </td>
              <td>{item.details || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}