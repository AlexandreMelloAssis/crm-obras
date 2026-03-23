"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { useWork } from "@/features/works/context/WorkContext";
import { useWorkDetails } from "@/features/works/hooks/useWorkDetails";
import { WorkStatusBadge } from "@/features/works/components/WorkStatusBadge";
import { LoadingState } from "@/shared/components/common/LoadingState";
import { ErrorState } from "@/shared/components/common/ErrorState";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { useCostSummary } from "@/features/costs/hooks/useCosts";
import type { UploadedDocumentLocal } from "@/features/documents/types/document.types";
import { useAppSettings } from "@/shared/hooks/useAppSettings";
import { PersistenceBadge } from "@/shared/components/common/PersistenceBadge";
import { StatCard } from "@/shared/components/common/StatCard";

type CostRecord = {
  id: string;
  workId: string;
  amount: number;
  description: string;
};

type StageRecord = {
  id: string;
  workId: string;
  name: string;
  status: "Pending" | "InProgress" | "Completed";
};

type FinancingRecord = {
  id: string;
  workId: string;
  amount: number;
  status: "Planned" | "Approved" | "Released" | "Closed";
};

type QuotationRecord = {
  id: string;
  workId?: string;
  title: string;
  status: "Rascunho" | "Enviada" | "Em analise" | "Concluida";
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

export default function WorkDetailsPage() {
  const params = useParams<{ id: string }>();
  const workId = params?.id;
  const { works, currentWork, setCurrentWork } = useWork();
  const { data: work, isLoading, isError } = useWorkDetails(workId);
  const { settings } = useAppSettings();
  const costSummary = useCostSummary(workId);

  const [costs] = useLocalStorage<CostRecord[]>("crm-obras:costs-local", []);
  const [documents] = useLocalStorage<UploadedDocumentLocal[]>("crm-obras:documents-local", []);
  const [stages] = useLocalStorage<StageRecord[]>("crm-obras:stages-local", []);
  const [financing] = useLocalStorage<FinancingRecord[]>("crm-obras:financing-local", []);
  const [quotations] = useLocalStorage<QuotationRecord[]>("crm-obras:quotations-local", []);

  const hasAccess = works.some((item) => item.id === workId);

  const workCosts = costs.filter((item) => item.workId === workId);
  const workDocuments = documents
    .filter((item) => item.workId === workId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  const workStages = stages.filter((item) => item.workId === workId);
  const workFinancing = financing.filter((item) => item.workId === workId);
  const openQuotations = quotations.filter((item) => item.workId === workId && item.status !== "Concluida").length;
  const completedStages = workStages.filter((item) => item.status === "Completed").length;
  const stageProgress = workStages.length > 0 ? Math.round((completedStages / workStages.length) * 100) : 0;
  const openFinancingAmount = workFinancing
    .filter((item) => item.status !== "Closed")
    .reduce((acc, item) => acc + item.amount, 0);

  if (!hasAccess && works.length > 0) {
    return (
      <PageShell title="Detalhe da Obra" subtitle="Controle de acesso por obra aplicado." requiredPermission="works.select.view">
        <EmptyState
          title="Acesso nao autorizado"
          description="Essa obra nao esta vinculada ao seu usuario."
          action={
            <Link className="btn btn-primary" href="/obras">
              Voltar para minhas obras
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Detalhe da Obra"
      subtitle="Visao geral da obra ativa para operacoes e acompanhamento."
      requiredPermission="works.select.view"
    >
      {isLoading ? (
        <LoadingState title="Carregando obra" description="Estamos consultando os dados detalhados da obra." />
      ) : isError || !work ? (
        <ErrorState
          description="Valide se a API esta disponivel e tente novamente."
          action={
            <Link className="btn btn-secondary" href="/obras">
              Voltar
            </Link>
          }
        />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Status</div>
              <div style={{ marginBottom: "0.5rem" }}>
                <WorkStatusBadge work={work} />
              </div>
              <div className="stat-change positive">Situacao operacional atual</div>
            </div>
            <StatCard
              label="Custo consolidado"
              value={costSummary.isLoading ? "..." : formatCurrency(costSummary.data?.total || 0)}
              helper="Resumo financeiro retornado pela API"
            />
            <StatCard
              label="Progresso das etapas"
              value={`${stageProgress}%`}
              helper={`${completedStages} de ${workStages.length} concluidas`}
            />
            <StatCard
              label="Financiamento em aberto"
              value={formatCurrency(openFinancingAmount)}
              helper="Compromissos nao encerrados"
            />
          </div>

          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Resumo da obra</h3>
                  <p className="card-subtitle">Dados principais e contexto do projeto.</p>
                </div>
              </div>

              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.875rem" }}>
                <li>Nome: <strong>{work.name}</strong></li>
                <li>Endereco: <strong>{work.address || "Sem endereco"}</strong></li>
                <li>Obra ativa: <strong>{currentWork?.id === work.id ? "Sim" : "Nao"}</strong></li>
                <li>Custos locais: <strong>{workCosts.length}</strong></li>
                <li>Documentos locais: <strong>{workDocuments.length}</strong></li>
                <li>Cotacoes pendentes: <strong>{openQuotations}</strong></li>
              </ul>

              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span className="stat-label">Avanco fisico registrado</span>
                  <strong>{stageProgress}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill accent" style={{ width: `${stageProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Acoes e atalhos</h3>
                  <p className="card-subtitle">Acesse rapidamente os modulos ligados a esta obra.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {currentWork?.id !== work.id ? (
                  <button type="button" className="btn btn-primary" onClick={() => setCurrentWork(work.id)}>
                    Tornar obra ativa
                  </button>
                ) : (
                  <span className="badge badge-green">Esta e sua obra ativa</span>
                )}
                <Link className="btn btn-secondary" href={settings.preferredWorkModule}>
                  Modulo preferido
                </Link>
                <Link className="btn btn-secondary" href="/obras">
                  Voltar para listagem
                </Link>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link className="btn btn-ghost" href="/custos">Custos</Link>
                <Link className="btn btn-ghost" href="/documentos">Documentos</Link>
                <Link className="btn btn-ghost" href="/etapas">Etapas</Link>
                <Link className="btn btn-ghost" href="/financiamento">Financiamento</Link>
              </div>
            </div>
          </div>

          <div className="two-col" style={{ marginTop: "1.5rem" }}>
            <div className="card">
              <div className="card-header">
              <div>
                <h3 className="card-title">Ultimos documentos</h3>
                <p className="card-subtitle">Arquivos mais recentes registrados para a obra.</p>
              </div>
              <PersistenceBadge mode="local" />
            </div>

              {workDocuments.length === 0 ? (
                <EmptyState
                  title="Nenhum documento registrado"
                  description="Os uploads da obra aparecerao aqui assim que forem enviados."
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

            <div className="card">
              <div className="card-header">
              <div>
                <h3 className="card-title">Cronograma e financiamento</h3>
                <p className="card-subtitle">Leitura rapida dos compromissos da obra.</p>
              </div>
              <PersistenceBadge mode="hybrid" />
            </div>

              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.875rem" }}>
                <li>Etapas registradas: <strong>{workStages.length}</strong></li>
                <li>Etapas concluidas: <strong>{completedStages}</strong></li>
                <li>Financiamentos ativos: <strong>{workFinancing.filter((item) => item.status !== "Closed").length}</strong></li>
                <li>Valor em aberto: <strong>{formatCurrency(openFinancingAmount)}</strong></li>
              </ul>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
