"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useWork } from "@/features/works/context/WorkContext";
import { costsApi } from "@/features/costs/services/costs.api";
import type { UploadedDocumentLocal } from "@/features/documents/types/document.types";
import { LoadingState } from "@/shared/components/common/LoadingState";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterBar } from "@/shared/components/common/FilterBar";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { WorkStatusBadge } from "@/features/works/components/WorkStatusBadge";
import { PersistenceBadge } from "@/shared/components/common/PersistenceBadge";

type WorkReportRow = {
  workId: string;
  workName: string;
  workStatus?: string;
  total: number;
  categories: number;
  localCosts: number;
  localDocuments: number;
  localStages: number;
  completedStages: number;
  localFinancing: number;
  openFinancingAmount: number;
  error?: string;
};

type CostRecord = {
  id: string;
  workId: string;
  amount: number;
};

type StageRecord = {
  id: string;
  workId: string;
  status: "Pending" | "InProgress" | "Completed";
};

type FinancingRecord = {
  id: string;
  workId: string;
  amount: number;
  status: "Planned" | "Approved" | "Released" | "Closed";
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Falha ao consolidar dados";
}

export default function RelatoriosPage() {
  const { works } = useWork();
  const [rows, setRows] = useState<WorkReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "healthy" | "warning">("all");

  const [localCosts] = useLocalStorage<CostRecord[]>("crm-obras:costs-local", []);
  const [localDocuments] = useLocalStorage<UploadedDocumentLocal[]>("crm-obras:documents-local", []);
  const [localStages] = useLocalStorage<StageRecord[]>("crm-obras:stages-local", []);
  const [localFinancing] = useLocalStorage<FinancingRecord[]>("crm-obras:financing-local", []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (works.length === 0) {
        setRows([]);
        return;
      }

      setIsLoading(true);

      try {
        const result = await Promise.all(
          works.map(async (work) => {
            const workCostItems = localCosts.filter((item) => item.workId === work.id);
            const workDocumentItems = localDocuments.filter((item) => item.workId === work.id);
            const workStageItems = localStages.filter((item) => item.workId === work.id);
            const workFinancingItems = localFinancing.filter((item) => item.workId === work.id);

            try {
              const summary = await costsApi.getSummary(work.id);
              return {
                workId: work.id,
                workName: work.name,
                workStatus: work.status,
                total: summary.total,
                categories: Object.keys(summary.byType || {}).length,
                localCosts: workCostItems.length,
                localDocuments: workDocumentItems.length,
                localStages: workStageItems.length,
                completedStages: workStageItems.filter((item) => item.status === "Completed").length,
                localFinancing: workFinancingItems.length,
                openFinancingAmount: workFinancingItems
                  .filter((item) => item.status !== "Closed")
                  .reduce((acc, item) => acc + item.amount, 0),
              } satisfies WorkReportRow;
            } catch (error) {
              return {
                workId: work.id,
                workName: work.name,
                workStatus: work.status,
                total: 0,
                categories: 0,
                localCosts: workCostItems.length,
                localDocuments: workDocumentItems.length,
                localStages: workStageItems.length,
                completedStages: workStageItems.filter((item) => item.status === "Completed").length,
                localFinancing: workFinancingItems.length,
                openFinancingAmount: workFinancingItems
                  .filter((item) => item.status !== "Closed")
                  .reduce((acc, item) => acc + item.amount, 0),
                error: normalizeError(error),
              } satisfies WorkReportRow;
            }
          })
        );

        if (!mounted) return;
        setRows(result);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [works, localCosts, localDocuments, localStages, localFinancing]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        term.length === 0 ||
        row.workName.toLowerCase().includes(term) ||
        (row.workStatus || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "healthy" && !row.error) ||
        (statusFilter === "warning" && Boolean(row.error));

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const totalGeneral = useMemo(() => filteredRows.reduce((acc, row) => acc + row.total, 0), [filteredRows]);
  const withError = useMemo(() => filteredRows.filter((row) => row.error).length, [filteredRows]);
  const totalDocuments = useMemo(() => filteredRows.reduce((acc, row) => acc + row.localDocuments, 0), [filteredRows]);
  const totalStages = useMemo(() => filteredRows.reduce((acc, row) => acc + row.localStages, 0), [filteredRows]);
  const topCostWork = useMemo(() => {
    return filteredRows
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total)[0] ?? null;
  }, [filteredRows]);

  return (
    <PageShell
      title="Relatorios"
      subtitle="Consolidado financeiro e operacional com dados do backend e da operacao local."
      requiredPermission="reports.view"
    >
      <FilterBar title="Filtros do relatorio" description="Busque por obra e refine a consolidacao exibida.">
        <div className="two-col">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <SearchInput
              placeholder="Ex.: residencial, andamento, concluida"
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            >
              <option value="all">Todos os status de coleta</option>
              <option value="healthy">Somente obras sem pendencia</option>
              <option value="warning">Somente obras com pendencia</option>
            </select>
          </div>
        </div>
      </FilterBar>

      <div className="stats-grid" style={{ marginTop: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-label">Obras analisadas</div>
          <div className="stat-value">{filteredRows.length}</div>
          <div className="stat-change positive">Base filtrada de consolidacao</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Custo total consolidado</div>
          <div className="stat-value">{formatCurrency(totalGeneral)}</div>
          <div className="stat-change positive">Somatorio do backend por obra</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Documentos mapeados</div>
          <div className="stat-value">{totalDocuments}</div>
          <div className="stat-change positive">Registros locais associados</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Obras com pendencia</div>
          <div className="stat-value">{withError}</div>
          <div className="stat-change negative">Falhas na coleta de resumo</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Destaques</h3>
              <p className="card-subtitle">Leitura rapida dos principais achados do consolidado.</p>
            </div>
          </div>

          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
            <li>Total de etapas registradas: <strong>{totalStages}</strong></li>
            <li>
              Maior custo consolidado:
              {" "}
              <strong>{topCostWork ? `${topCostWork.workName} (${formatCurrency(topCostWork.total)})` : "Nao identificado"}</strong>
            </li>
            <li>Obras saudaveis: <strong>{filteredRows.length - withError}</strong></li>
            <li>Obras com falha de integracao: <strong>{withError}</strong></li>
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Atalhos</h3>
              <p className="card-subtitle">Acesse rapidamente os modulos operacionais relacionados.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link className="btn btn-secondary" href="/custos">
              Custos
            </Link>
            <Link className="btn btn-secondary" href="/documentos">
              Documentos
            </Link>
            <Link className="btn btn-secondary" href="/etapas">
              Etapas
            </Link>
            <Link className="btn btn-primary" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Resumo por obra</h3>
            <p className="card-subtitle">Financeiro, documentos, etapas e financiamento por obra autorizada.</p>
          </div>
          <PersistenceBadge mode="hybrid" />
        </div>

        {isLoading ? (
          <LoadingState title="Gerando relatorio" description="Consolidando os indicadores por obra." />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="Nenhuma obra disponivel"
            description="Nao existem obras suficientes para consolidacao com o filtro atual."
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Obra</th>
                  <th>Status</th>
                  <th>Custo backend</th>
                  <th>Custos locais</th>
                  <th>Documentos</th>
                  <th>Etapas concluidas</th>
                  <th>Financiamento aberto</th>
                  <th>Coleta</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.workId}>
                    <td>{row.workName}</td>
                    <td>
                      <WorkStatusBadge work={{ status: row.workStatus || "Planning" }} />
                    </td>
                    <td>{formatCurrency(row.total)}</td>
                    <td>{row.localCosts}</td>
                    <td>{row.localDocuments}</td>
                    <td>{row.completedStages}/{row.localStages}</td>
                    <td>{formatCurrency(row.openFinancingAmount)}</td>
                    <td>
                      {row.error ? <span className="badge badge-orange">Com pendencia</span> : <span className="badge badge-green">OK</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
