"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useWork } from "@/features/works/context/WorkContext";
import { PageShell } from "@/components/PageShell";
import { WorkStatusBadge } from "@/features/works/components/WorkStatusBadge";
import { useCostSummary } from "@/features/costs/hooks/useCosts";
import type { UploadedDocumentLocal } from "@/features/documents/types/document.types";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { LoadingState } from "@/shared/components/common/LoadingState";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { ErrorState } from "@/shared/components/common/ErrorState";
import { PersistenceBadge } from "@/shared/components/common/PersistenceBadge";
import { StatCard } from "@/shared/components/common/StatCard";

type QuotationRecord = {
  id: string;
  workId?: string;
  title: string;
  itemDescription: string;
  status: "Rascunho" | "Enviada" | "Em analise" | "Concluida";
  offers: Array<{ price: number }>;
  justification?: string;
};

type CostRecord = {
  id: string;
  workId: string;
  costType: number;
  amount: number;
  description: string;
  createdAt: string;
};

type StageRecord = {
  id: string;
  workId: string;
  name: string;
  description?: string;
  status: "Pending" | "InProgress" | "Completed";
  createdAt: string;
};

type FinancingRecord = {
  id: string;
  workId: string;
  title: string;
  institution: string;
  amount: number;
  dueDate?: string;
  status: "Planned" | "Approved" | "Released" | "Closed";
  notes?: string;
  createdAt: string;
};

type AuditEvent = {
  id: string;
  at: string;
  action: string;
  entity: string;
  details?: string;
  level: "info" | "warning" | "success" | "error";
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentWork, works, isLoading } = useWork();
  const costSummary = useCostSummary(currentWork?.id);

  const [quotations] = useLocalStorage<QuotationRecord[]>("crm-obras:quotations-local", []);
  const [documents] = useLocalStorage<UploadedDocumentLocal[]>("crm-obras:documents-local", []);
  const [costRecords] = useLocalStorage<CostRecord[]>("crm-obras:costs-local", []);
  const [stages] = useLocalStorage<StageRecord[]>("crm-obras:stages-local", []);
  const [financing] = useLocalStorage<FinancingRecord[]>("crm-obras:financing-local", []);
  const [auditEvents] = useLocalStorage<AuditEvent[]>("crm-obras:audit-log", []);

  const concluded = works.filter((work) => work.status?.toLowerCase().includes("concl")).length;
  const inProgress = works.filter((work) => {
    const status = work.status?.toLowerCase() ?? "";
    return status.includes("progress") || status.includes("exec") || status.includes("andamento") || status.includes("ativo");
  }).length;
  const pending = works.length - concluded - inProgress;

  const workDocuments = documents
    .filter((item) => item.workId === currentWork?.id)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  const workCosts = costRecords.filter((item) => item.workId === currentWork?.id);
  const workStages = stages.filter((item) => item.workId === currentWork?.id);
  const workFinancing = financing.filter((item) => item.workId === currentWork?.id);
  const completedStages = workStages.filter((item) => item.status === "Completed").length;
  const stageProgress = workStages.length > 0 ? Math.round((completedStages / workStages.length) * 100) : 0;
  const openFinancingTotal = workFinancing
    .filter((item) => item.status !== "Closed")
    .reduce((acc, item) => acc + item.amount, 0);
  const pendingQuotations = quotations.filter((item) => item.status !== "Concluida").length;
  const recentAudit = auditEvents.slice(0, 4);

  return (
    <PageShell
      title="Dashboard"
      subtitle={`Bem-vindo${user?.fullName ? `, ${user.fullName}` : ""}. Acompanhe os indicadores da obra.`}
      requiredPermission="dashboard.view"
    >
      <div className="stats-grid">
        <StatCard label="Total de obras" value={isLoading ? "..." : works.length} helper="Obras disponiveis para seu usuario" />
        <StatCard label="Em andamento" value={isLoading ? "..." : inProgress} helper="Obras em execucao no momento" />
        <StatCard label="Concluidas" value={isLoading ? "..." : concluded} helper="Obras encerradas" />
        <StatCard label="Cotacoes em aberto" value={pendingQuotations} helper="Demandas aguardando comparacao" />
      </div>

      {!currentWork ? (
        <EmptyState
          title="Nenhuma obra ativa"
          description="Selecione uma obra no menu para acompanhar custos, etapas, documentos e financiamento."
          action={
            <Link className="btn btn-primary" href="/obras">
              Ir para minhas obras
            </Link>
          }
        />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Custo consolidado"
              value={costSummary.isLoading ? "..." : formatCurrency(costSummary.data?.total || 0)}
              helper="Resumo retornado pelo backend"
            />
            <StatCard label="Lancamentos locais" value={workCosts.length} helper="Registros adicionados pela equipe" />
            <StatCard label="Progresso fisico" value={`${stageProgress}%`} helper={`${completedStages} etapa(s) concluidas`} />
            <StatCard label="Financiamento em aberto" value={formatCurrency(openFinancingTotal)} helper="Registros nao encerrados" />
          </div>

          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Obra ativa</h3>
                  <p className="card-subtitle">Projeto selecionado no momento</p>
                </div>
                <WorkStatusBadge work={currentWork} />
              </div>

              <p><strong>{currentWork.name}</strong></p>
              <p>{currentWork.address || "Sem endereco cadastrado."}</p>

              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span className="stat-label">Avanco das etapas</span>
                  <strong>{stageProgress}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill accent" style={{ width: `${stageProgress}%` }} />
                </div>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link className="btn btn-secondary" href={`/obras/${currentWork.id}`}>
                  Ver detalhe
                </Link>
                <Link className="btn btn-primary" href="/obras">
                  Trocar obra ativa
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Indicadores operacionais</h3>
                  <p className="card-subtitle">Visao rapida para planejamento diario</p>
                </div>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.875rem" }}>
                <li>Obra ativa: <strong>{currentWork.name}</strong></li>
                <li>Status atual: <WorkStatusBadge work={currentWork} /></li>
                <li>Documentos recentes: <strong>{workDocuments.length}</strong></li>
                <li>Etapas registradas: <strong>{workStages.length}</strong></li>
                <li>Financiamentos vinculados: <strong>{workFinancing.length}</strong></li>
              </ul>
            </div>
          </div>

          <div className="two-col" style={{ marginTop: "1.5rem" }}>
            <div className="card">
              <div className="card-header">
              <div>
                <h3 className="card-title">Resumo financeiro</h3>
                <p className="card-subtitle">Categorias de custo e exposicao de financiamento</p>
              </div>
              <PersistenceBadge mode="hybrid" />
            </div>

              {costSummary.isLoading ? (
                <LoadingState title="Carregando custos" description="Consultando o consolidado financeiro da obra." />
              ) : costSummary.isError ? (
                <ErrorState description="Nao foi possivel consultar o resumo financeiro da obra ativa." />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Indicador</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(costSummary.data?.byType || {}).map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{formatCurrency(value)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td>Financiamento em aberto</td>
                        <td>{formatCurrency(openFinancingTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
              <div>
                <h3 className="card-title">Documentos recentes</h3>
                <p className="card-subtitle">Ultimos arquivos registrados para a obra ativa</p>
              </div>
              <PersistenceBadge mode="local" />
            </div>

              {workDocuments.length === 0 ? (
                <EmptyState
                  title="Nenhum documento recente"
                  description="Envie anexos na tela de documentos para acompanhar aqui."
                />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Arquivo</th>
                        <th>Categoria</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workDocuments.slice(0, 4).map((item) => (
                        <tr key={item.id}>
                          <td>{item.fileName}</td>
                          <td>{item.categoryLabel || item.categoryId}</td>
                          <td>{formatDate(item.uploadedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="two-col" style={{ marginTop: "1.5rem" }}>
            <div className="card">
              <div className="card-header">
              <div>
                <h3 className="card-title">Etapas e pendencias</h3>
                <p className="card-subtitle">Andamento local do cronograma</p>
              </div>
              <PersistenceBadge mode="local" />
            </div>

              {workStages.length === 0 ? (
                <EmptyState
                  title="Nenhuma etapa cadastrada"
                  description="Cadastre etapas para acompanhar o progresso da obra no dashboard."
                />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Etapa</th>
                        <th>Status</th>
                        <th>Descricao</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workStages.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                            <span className={item.status === "Completed" ? "badge badge-green" : item.status === "InProgress" ? "badge badge-blue" : "badge badge-orange"}>
                              {item.status === "Completed" ? "Concluida" : item.status === "InProgress" ? "Em andamento" : "Pendente"}
                            </span>
                          </td>
                          <td>{item.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
              <div>
                <h3 className="card-title">Atividade recente</h3>
                <p className="card-subtitle">Ultimos eventos operacionais registrados no frontend</p>
              </div>
              <PersistenceBadge mode="local" />
            </div>

              {recentAudit.length === 0 ? (
                <EmptyState
                  title="Nenhuma atividade recente"
                  description="As acoes operacionais registradas no sistema aparecerao aqui."
                />
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
                  {recentAudit.map((item) => (
                    <li key={item.id} className="activity-item" style={{ padding: "0.75rem 0" }}>
                      <div className={`activity-icon ${item.level === "error" ? "orange" : item.level === "success" ? "green" : "blue"}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 8v4" />
                          <path d="M12 16h.01" />
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">
                          <strong>{item.entity}</strong>: {item.action}
                        </div>
                        <div className="activity-time">
                          {item.details || "Sem detalhes"} - {formatDate(item.at)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
