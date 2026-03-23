"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { FinancingForm, type FinancingFormValues } from "@/features/financing/components/FinancingForm";
import { useFinancingLocal } from "@/features/financing/hooks/useFinancingLocal";
import { useFinancingStagesLocal } from "@/features/financing/hooks/useFinancingStagesLocal";
import type { FinancingRecord } from "@/features/financing/types/financing.types";
import { useWork } from "@/features/works/context/WorkContext";
import { PermissionGate } from "@/shared/components/auth/PermissionGate";
import { FeedbackNotice } from "@/shared/components/common/FeedbackNotice";
import { PersistenceBadge, PersistenceNotice } from "@/shared/components/common/PersistenceBadge";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { usePageFeedback } from "@/shared/hooks/usePageFeedback";
import { appendAuditEvent } from "@/shared/utils/auditLog";
import { parseApiError } from "@/shared/utils/apiError";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("pt-BR");
}

export default function FinanciamentoList() {
  const { currentWork } = useWork();
  const { financing, createFinancing, updateFinancing, removeFinancing } = useFinancingLocal(currentWork?.id);
  const { getStagesByFinancing, replaceStages, removeStagesByFinancing } = useFinancingStagesLocal(currentWork?.id);

  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState<FinancingRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { feedback, showFeedback, clearFeedback } = usePageFeedback();
  const { requestConfirmation, dialog } = useConfirmDialog();

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return financing;

    return financing.filter((record) => {
      const stageNames = getStagesByFinancing(record.id)
        .map((stage) => stage.stageName.toLowerCase())
        .join(" ");

      return (
        record.title.toLowerCase().includes(term) ||
        record.institution.toLowerCase().includes(term) ||
        record.contractNumber.toLowerCase().includes(term) ||
        stageNames.includes(term)
      );
    });
  }, [financing, getStagesByFinancing, search]);

  const handleCreate = async (values: FinancingFormValues) => {
    clearFeedback();
    setIsSubmitting(true);

    try {
      const next = createFinancing({
        title: values.title,
        institution: values.institution,
        contractNumber: values.contractNumber,
        amount: values.amount,
        contractSigningDate: values.contractSigningDate,
      });

      replaceStages(next.id, values.stages);

      showFeedback("Financiamento cadastrado com sucesso.", "success");
      appendAuditEvent({
        action: "Criacao",
        entity: "Financiamento",
        details: values.title,
        level: "success",
      });
      return true;
    } catch (error) {
      showFeedback(parseApiError(error, "Nao foi possivel cadastrar o financiamento."), "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (values: FinancingFormValues) => {
    if (!editingRecord) return false;

    clearFeedback();
    setIsSubmitting(true);

    try {
      updateFinancing(editingRecord.id, {
        title: values.title,
        institution: values.institution,
        contractNumber: values.contractNumber,
        amount: values.amount,
        contractSigningDate: values.contractSigningDate,
      });

      replaceStages(editingRecord.id, values.stages);

      showFeedback("Financiamento atualizado com sucesso.", "success");
      appendAuditEvent({
        action: "Atualizacao",
        entity: "Financiamento",
        details: values.title,
        level: "success",
      });
      setEditingRecord(null);
      return true;
    } catch (error) {
      showFeedback(parseApiError(error, "Nao foi possivel atualizar o financiamento."), "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (record: FinancingRecord) => {
    requestConfirmation({
      title: "Excluir financiamento",
      description: `Deseja excluir o financiamento "${record.title}"?`,
      confirmLabel: "Excluir financiamento",
      tone: "danger",
      onConfirm: () => {
        removeFinancing(record.id);
        removeStagesByFinancing(record.id);

        if (editingRecord?.id === record.id) {
          setEditingRecord(null);
        }

        showFeedback("Financiamento removido com sucesso.", "success");
        appendAuditEvent({
          action: "Exclusao",
          entity: "Financiamento",
          details: record.title,
          level: "warning",
        });
      },
    });
  };

  if (!currentWork) {
    return (
      <PageShell
        title="Financiamento"
        subtitle="Selecione uma obra ativa para gerenciar os contratos de financiamento."
        requiredPermission="works.manage.view"
      >
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Nenhuma obra ativa</h3>
              <p className="card-subtitle">Escolha uma obra antes de cadastrar contratos e etapas vinculadas.</p>
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
      title="Financiamento"
      subtitle={`Gestao dos contratos da obra ativa: ${currentWork.name}.`}
      requiredPermission="works.manage.view"
    >
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{editingRecord ? "Editar financiamento" : "Novo financiamento"}</h3>
            <p className="card-subtitle">
              Cadastre apenas os dados obrigatorios do contrato e relacione as etapas da obra a este financiamento.
            </p>
          </div>
          <PersistenceBadge mode="hybrid" />
        </div>

        <PersistenceNotice
          mode="hybrid"
          title="Persistencia deste modulo"
          description="O contrato e as etapas permanecem locais por obra. Os uploads de apoio continuam sendo enviados para o modulo de documentos."
        />

        <div style={{ marginTop: "1rem" }}>
          <PermissionGate permission="works.manage.update" fallback={<p>Sem permissao para gerenciar financiamentos.</p>}>
            <FinancingForm
              workId={currentWork.id}
              initialValues={editingRecord}
              initialStages={editingRecord ? getStagesByFinancing(editingRecord.id) : []}
              onSubmit={editingRecord ? handleUpdate : handleCreate}
              onCancel={editingRecord ? () => setEditingRecord(null) : undefined}
              isSubmitting={isSubmitting}
              submitLabel={editingRecord ? "Salvar alteracoes" : "Cadastrar financiamento"}
              resetOnSuccess={!editingRecord}
            />
          </PermissionGate>
        </div>

        <FeedbackNotice feedback={feedback} />
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Registros de financiamento</h3>
            <p className="card-subtitle">Contratos cadastrados para a obra ativa.</p>
          </div>
          <PersistenceBadge mode="hybrid" />
        </div>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por titulo, instituicao, numero do contrato ou etapa..."
          />
        </div>

        {filteredRecords.length === 0 ? (
          <p>Nenhum financiamento encontrado para o filtro informado.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Instituicao</th>
                  <th>Contrato</th>
                  <th>Valor financiado</th>
                  <th>Assinatura</th>
                  <th>Etapas</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const stages = getStagesByFinancing(record.id);

                  return (
                    <tr key={record.id}>
                      <td>{record.title}</td>
                      <td>{record.institution}</td>
                      <td>{record.contractNumber}</td>
                      <td>{formatCurrency(record.amount)}</td>
                      <td>{formatDate(record.contractSigningDate)}</td>
                      <td>
                        {stages.length > 0 ? (
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            {stages.map((stage) => (
                              <span key={stage.id} className="badge">
                                {stage.stageName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <PermissionGate permission="works.manage.update">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setEditingRecord(record)}
                            >
                              Editar
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="works.manage.delete">
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => handleDelete(record)}
                            >
                              Excluir
                            </button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {dialog}
    </PageShell>
  );
}
