"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useWork } from "@/features/works/context/WorkContext";
import { CostForm, type CostFormValues } from "@/features/costs/components/CostForm";
import { useCostSummary, useCreateCost } from "@/features/costs/hooks/useCosts";
import { COST_TYPE_OPTIONS } from "@/features/costs/types/cost.types";
import { PermissionGate } from "@/shared/components/auth/PermissionGate";
import { appendAuditEvent } from "@/shared/utils/auditLog";
import { parseApiError } from "@/shared/utils/apiError";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { usePageFeedback } from "@/shared/hooks/usePageFeedback";
import { FeedbackNotice } from "@/shared/components/common/FeedbackNotice";
import { PersistenceBadge, PersistenceNotice } from "@/shared/components/common/PersistenceBadge";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterBar } from "@/shared/components/common/FilterBar";
import { LoadingState } from "@/shared/components/common/LoadingState";
import { ErrorState } from "@/shared/components/common/ErrorState";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { StatCard } from "@/shared/components/common/StatCard";

type CostRecord = {
  id: string;
  workId: string;
  costType: number;
  amount: number;
  description: string;
  createdAt: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export default function CustosPage() {
  const { currentWork } = useWork();
  const { feedback, showFeedback, clearFeedback } = usePageFeedback();
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [costRecords, setCostRecords] = useLocalStorage<CostRecord[]>("crm-obras:costs-local", []);
  const { requestConfirmation, dialog } = useConfirmDialog();

  const summary = useCostSummary(currentWork?.id);
  const createCost = useCreateCost(currentWork?.id);

  const byType = useMemo(() => {
    const map = summary.data?.byType || {};
    const labels: Record<string, string> = {
      Labor: "Mao de obra",
      Utility: "Utilidades",
      Material: "Materiais",
      Misc: "Diversos",
    };

    return Object.entries(map).map(([key, value]) => ({
      key,
      label: labels[key] || key,
      value,
    }));
  }, [summary.data]);

  const workCosts = useMemo(
    () => costRecords.filter((item) => item.workId === currentWork?.id),
    [costRecords, currentWork?.id]
  );

  const editingCost = useMemo(
    () => workCosts.find((item) => item.id === editingCostId) ?? null,
    [workCosts, editingCostId]
  );

  const costTypeLabel = useMemo(() => {
    const map: Record<number, string> = {};
    for (const option of COST_TYPE_OPTIONS) {
      map[option.value] = option.label;
    }
    return map;
  }, []);

  const filteredWorkCosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return workCosts;
    return workCosts.filter((item) => {
      const description = item.description.toLowerCase();
      const type = (costTypeLabel[item.costType] ?? "").toLowerCase();
      return description.includes(term) || type.includes(term);
    });
  }, [workCosts, search, costTypeLabel]);

  const handleCreate = async (values: CostFormValues) => {
    if (!currentWork) return;

    clearFeedback();

    try {
      const id = await createCost.mutateAsync({
        workId: currentWork.id,
        costType: values.costType as 1 | 2 | 3 | 4,
        amount: values.amount,
        description: values.description.trim(),
      });

      setCostRecords((prev) => [
        {
          id,
          workId: currentWork.id,
          costType: values.costType,
          amount: values.amount,
          description: values.description.trim(),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      showFeedback("Custo lancado com sucesso.", "success");
      appendAuditEvent({
        action: "Lancamento",
        entity: "Custo",
        details: `${values.description.trim()} - ${formatCurrency(values.amount)}`,
        level: "success",
      });
      return true;
    } catch (error) {
      showFeedback(parseApiError(error), "error");
      appendAuditEvent({
        action: "Falha no lancamento",
        entity: "Custo",
        details: parseApiError(error),
        level: "error",
      });
      return false;
    }
  };

  const handleUpdateLocal = async (values: CostFormValues) => {
    if (!editingCost) return;

    setCostRecords((prev) =>
      prev.map((item) =>
        item.id === editingCost.id
          ? {
              ...item,
              costType: values.costType,
              amount: values.amount,
              description: values.description.trim(),
            }
          : item
      )
    );

    setEditingCostId(null);
    showFeedback("Custo atualizado na camada de frontend.", "info");
    return true;
  };

  const handleDeleteLocal = (id: string) => {
    const target = workCosts.find((item) => item.id === id);
    if (!target) return;

    requestConfirmation({
      title: "Excluir custo",
      description: `Deseja excluir o custo "${target.description}"?`,
      confirmLabel: "Excluir custo",
      tone: "danger",
      onConfirm: () => {
        setCostRecords((prev) => prev.filter((item) => item.id !== id));
        if (editingCostId === id) {
          setEditingCostId(null);
        }
        showFeedback("Custo excluido na camada de frontend.", "success");
      },
    });
  };

  if (!currentWork) {
    return (
      <PageShell
        title="Custos"
        subtitle="Selecione uma obra ativa para gerenciar custos."
        requiredPermission="costs.manage.view"
      >
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Nenhuma obra ativa</h3>
              <p className="card-subtitle">Escolha uma obra antes de lancar ou consultar custos.</p>
            </div>
          </div>
          <Link className="btn btn-primary" href="/obras">
            Ir para obras
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Custos"
      subtitle={`Controle financeiro da obra ativa: ${currentWork.name}.`}
      requiredPermission="costs.manage.view"
    >
      <div className="stats-grid">
        <StatCard
          label="Total consolidado"
          value={summary.isLoading ? "..." : formatCurrency(summary.data?.total || 0)}
          helper="Somatorio de custos lancados"
        />

        {byType.slice(0, 3).map((item) => (
          <StatCard key={item.key} label={item.label} value={formatCurrency(item.value)} helper="Subtotal por categoria" />
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Lancar custo</h3>
              <p className="card-subtitle">Registre materiais, mao de obra e demais despesas.</p>
            </div>
            <PersistenceBadge mode={editingCost ? "local" : "backend"} />
          </div>

          <PermissionGate permission="costs.manage.write" fallback={<p>Sem permissao para lancar custos.</p>}>
            <CostForm
              initialValues={
                editingCost
                  ? {
                      costType: editingCost.costType,
                      amount: editingCost.amount,
                      description: editingCost.description,
                    }
                  : null
              }
              onSubmit={editingCost ? handleUpdateLocal : handleCreate}
              onCancel={editingCost ? () => setEditingCostId(null) : undefined}
              isSubmitting={createCost.isPending}
              submitLabel={editingCost ? "Salvar alteracoes" : "Lancar custo"}
              resetOnSuccess={!editingCost}
            />
          </PermissionGate>
          <FeedbackNotice feedback={feedback} />
          <PersistenceNotice
            mode="hybrid"
            title="Persistencia deste modulo"
            description="O lancamento inicial vai para o backend. Ajustes e remocoes da lista local ainda ficam no navegador ate o backend expor esse CRUD completo."
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Resumo por tipo</h3>
              <p className="card-subtitle">Dados retornados pelo endpoint de resumo da obra.</p>
            </div>
            <PersistenceBadge mode="backend" />
          </div>

          {summary.isLoading ? (
            <LoadingState title="Carregando resumo" description="Consultando indicadores financeiros da obra ativa." />
          ) : summary.isError ? (
            <ErrorState title="Falha ao carregar resumo de custos" description={parseApiError(summary.error)} />
          ) : byType.length === 0 ? (
            <EmptyState title="Nenhum custo lancado" description="Realize o primeiro lancamento para visualizar o resumo." />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {byType.map((item) => (
                    <tr key={item.key}>
                      <td>{item.label}</td>
                      <td>{formatCurrency(item.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Lancamentos da obra (sessao local)</h3>
            <p className="card-subtitle">{workCosts.length} registro(s)</p>
          </div>
          <PersistenceBadge mode="local" />
        </div>

        <FilterBar title="Filtro de lancamentos" description="Busque por descricao ou tipo de custo">
          <SearchInput
            placeholder="Ex.: cimento, mao de obra, utilidades..."
            value={search}
            onChange={setSearch}
          />
        </FilterBar>

        {filteredWorkCosts.length === 0 ? (
          <EmptyState
            title="Nenhum lancamento encontrado"
            description={workCosts.length === 0 ? "Nenhum lancamento local registrado." : "Nenhum resultado para o filtro aplicado."}
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descricao</th>
                  <th>Valor</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkCosts.map((item) => (
                  <tr key={item.id}>
                    <td>{costTypeLabel[item.costType] || item.costType}</td>
                    <td>{item.description}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <PermissionGate permission="costs.manage.write">
                          <button type="button" className="btn btn-secondary" onClick={() => setEditingCostId(item.id)}>
                            Editar
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="costs.manage.write">
                          <button type="button" className="btn btn-ghost" onClick={() => handleDeleteLocal(item.id)}>
                            Excluir
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {dialog}
    </PageShell>
  );
}
