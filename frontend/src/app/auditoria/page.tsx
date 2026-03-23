"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { AuditLogList } from "@/shared/components/common/AuditLogList";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterBar } from "@/shared/components/common/FilterBar";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { clearAuditLog, readAuditLog, type AuditEvent } from "@/shared/utils/auditLog";

function uniqueEntities(items: AuditEvent[]) {
  return Array.from(new Set(items.map((item) => item.entity))).sort((a, b) => a.localeCompare(b));
}

export default function AuditoriaPage() {
  const [filter, setFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | AuditEvent["level"]>("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [version, setVersion] = useState(0);
  const { requestConfirmation, dialog } = useConfirmDialog();

  const allItems = useMemo(() => readAuditLog(), [version]);
  const entities = useMemo(() => uniqueEntities(allItems), [allItems]);

  const items = useMemo(() => {
    const term = filter.trim().toLowerCase();

    return allItems.filter((item) => {
      const matchesText =
        term.length === 0 ||
        item.action.toLowerCase().includes(term) ||
        item.entity.toLowerCase().includes(term) ||
        (item.details || "").toLowerCase().includes(term);

      const matchesLevel = levelFilter === "all" || item.level === levelFilter;
      const matchesEntity = entityFilter === "all" || item.entity === entityFilter;

      return matchesText && matchesLevel && matchesEntity;
    });
  }, [allItems, entityFilter, filter, levelFilter]);

  const summary = useMemo(() => {
    return {
      total: items.length,
      success: items.filter((item) => item.level === "success").length,
      warning: items.filter((item) => item.level === "warning").length,
      error: items.filter((item) => item.level === "error").length,
    };
  }, [items]);

  const handleClear = () => {
    requestConfirmation({
      title: "Limpar log de auditoria",
      description: "Deseja limpar o log de auditoria visual?",
      confirmLabel: "Limpar log",
      tone: "danger",
      onConfirm: () => {
        clearAuditLog();
        setVersion((prev) => prev + 1);
      },
    });
  };

  return (
    <PageShell
      title="Auditoria"
      subtitle="Registro visual de eventos operacionais no frontend."
      requiredPermission="users.manage.update"
    >
      <FilterBar title="Filtros" description="Refine por texto, nivel e entidade registrada.">
        <div className="two-col">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <SearchInput
              placeholder="Ex.: cotacao, fornecedor, falha"
              value={filter}
              onChange={setFilter}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              className="form-input"
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value as typeof levelFilter)}
            >
              <option value="all">Todos os niveis</option>
              <option value="success">Sucesso</option>
              <option value="warning">Aviso</option>
              <option value="error">Erro</option>
              <option value="info">Informacao</option>
            </select>
          </div>
        </div>

        <div className="two-col" style={{ marginTop: "1rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              className="form-input"
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value)}
            >
              <option value="all">Todas as entidades</option>
              {entities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" type="button" onClick={() => setVersion((prev) => prev + 1)}>
              Atualizar
            </button>
            <button className="btn btn-ghost" type="button" onClick={handleClear}>
              Limpar log
            </button>
          </div>
        </div>
      </FilterBar>

      <div className="stats-grid" style={{ marginTop: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-label">Eventos filtrados</div>
          <div className="stat-value">{summary.total}</div>
          <div className="stat-change positive">Base atual de auditoria</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sucessos</div>
          <div className="stat-value">{summary.success}</div>
          <div className="stat-change positive">Operacoes concluidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avisos</div>
          <div className="stat-value">{summary.warning}</div>
          <div className="stat-change negative">Eventos que pedem atencao</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Erros</div>
          <div className="stat-value">{summary.error}</div>
          <div className="stat-change negative">Falhas registradas</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Distribuicao por entidade</h3>
              <p className="card-subtitle">Resumo do que mais gerou eventos no frontend.</p>
            </div>
          </div>

          {entities.length === 0 ? (
            <EmptyState
              title="Nenhuma entidade registrada"
              description="As entidades auditadas aparecerao aqui conforme o uso do sistema."
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Entidade</th>
                    <th>Eventos</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.map((entity) => {
                    const count = allItems.filter((item) => item.entity === entity).length;
                    return (
                      <tr key={entity}>
                        <td>{entity}</td>
                        <td>{count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Leitura rapida</h3>
              <p className="card-subtitle">Sinalizacao para acompanhamento operacional.</p>
            </div>
          </div>

          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
            <li>Ultima sincronizacao visual: <strong>{allItems[0] ? new Date(allItems[0].at).toLocaleString("pt-BR") : "-"}</strong></li>
            <li>Entidades auditadas: <strong>{entities.length}</strong></li>
            <li>Eventos criticos filtrados: <strong>{summary.error}</strong></li>
            <li>Eventos com atencao: <strong>{summary.warning}</strong></li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Eventos</h3>
            <p className="card-subtitle">{items.length} registro(s) no log visual.</p>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Nenhum evento encontrado"
            description="Ajuste os filtros ou gere novas operacoes no sistema para popular a auditoria."
          />
        ) : (
          <AuditLogList items={items} />
        )}
      </div>

      {dialog}
    </PageShell>
  );
}
