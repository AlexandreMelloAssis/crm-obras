"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useWork } from "@/features/works/context/WorkContext";
import { PermissionGate } from "@/shared/components/auth/PermissionGate";
import { appendAuditEvent } from "@/shared/utils/auditLog";
import { parseApiError } from "@/shared/utils/apiError";
import { StageForm, type StageFormValues } from "@/features/stages/components/StageForm";
import { useStagesLocal } from "@/features/stages/hooks/useStagesLocal";
import type { StageRecord } from "@/features/stages/types/stage.types";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterBar } from "@/shared/components/common/FilterBar";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { usePageFeedback } from "@/shared/hooks/usePageFeedback";
import { FeedbackNotice } from "@/shared/components/common/FeedbackNotice";
import { PersistenceBadge, PersistenceNotice } from "@/shared/components/common/PersistenceBadge";

function stageStatusLabel(status: StageRecord["status"]) {
  if (status === "Completed") return "Concluida";
  if (status === "InProgress") return "Em andamento";
  return "Pendente";
}

function stageStatusClass(status: StageRecord["status"]) {
  if (status === "Completed") return "badge badge-green";
  if (status === "InProgress") return "badge badge-blue";
  return "badge badge-orange";
}

export default function EtapasList() {
  const { currentWork } = useWork();
  const { stages, createStage, updateStage, removeStage } = useStagesLocal(currentWork?.id);

  const [search, setSearch] = useState("");
  const [editingStage, setEditingStage] = useState<StageRecord | null>(null);
  const { feedback, showFeedback, clearFeedback } = usePageFeedback();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestConfirmation, dialog } = useConfirmDialog();

  const filteredStages = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return stages;

    return stages.filter((stage) => {
      const name = stage.name.toLowerCase();
      const description = stage.description?.toLowerCase() ?? "";
      const status = stage.status.toLowerCase();
      return name.includes(term) || description.includes(term) || status.includes(term);
    });
  }, [stages, search]);

  const handleCreate = async (values: StageFormValues) => {
    clearFeedback();
    setIsSubmitting(true);

    try {
      await createStage({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      });
      showFeedback("Etapa criada com sucesso.", "success");
      appendAuditEvent({
        action: "Criacao",
        entity: "Etapa",
        details: values.name.trim(),
        level: "success",
      });
      return true;
    } catch (error) {
      const message = parseApiError(error, "Erro ao criar etapa");
      showFeedback(message, "error");
      appendAuditEvent({
        action: "Falha ao criar",
        entity: "Etapa",
        details: message,
        level: "error",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (values: StageFormValues) => {
    if (!editingStage) return;

    clearFeedback();
    setIsSubmitting(true);

    try {
      updateStage(editingStage.id, {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        status: values.status,
      });
      showFeedback("Etapa atualizada com sucesso.", "success");
      appendAuditEvent({
        action: "Atualizacao",
        entity: "Etapa",
        details: values.name.trim(),
        level: "success",
      });
      setEditingStage(null);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (stage: StageRecord) => {
    requestConfirmation({
      title: "Excluir etapa",
      description: `Deseja excluir a etapa "${stage.name}"?`,
      confirmLabel: "Excluir etapa",
      tone: "danger",
      onConfirm: () => {
        removeStage(stage.id);
        if (editingStage?.id === stage.id) {
          setEditingStage(null);
        }

        showFeedback("Etapa removida com sucesso.", "success");
        appendAuditEvent({
          action: "Exclusao",
          entity: "Etapa",
          details: stage.name,
          level: "warning",
        });
      },
    });
  };

  if (!currentWork) {
    return (
      <PageShell
        title="Etapas"
        subtitle="Selecione uma obra ativa para gerenciar etapas."
        requiredPermission="works.manage.view"
      >
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Nenhuma obra ativa</h3>
              <p className="card-subtitle">Escolha uma obra antes de criar e organizar etapas.</p>
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
      title="Etapas"
      subtitle={`Planejamento e execucao das etapas da obra ativa: ${currentWork.name}.`}
      requiredPermission="works.manage.view"
    >
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{editingStage ? "Editar etapa" : "Nova etapa"}</h3>
              <p className="card-subtitle">
                {editingStage ? "Atualize nome, descricao e status da etapa." : "Crie uma nova etapa no cronograma da obra."}
              </p>
            </div>
            <PersistenceBadge mode={editingStage ? "local" : "hybrid"} />
          </div>

          <PermissionGate permission="works.manage.update" fallback={<p>Sem permissao para gerenciar etapas.</p>}>
            <StageForm
              initialValues={editingStage}
              onSubmit={editingStage ? handleUpdate : handleCreate}
              onCancel={editingStage ? () => setEditingStage(null) : undefined}
              isSubmitting={isSubmitting}
              submitLabel={editingStage ? "Salvar alteracoes" : "Cadastrar etapa"}
              includeStatus={Boolean(editingStage)}
              resetOnSuccess={!editingStage}
            />
          </PermissionGate>

          <FeedbackNotice feedback={feedback} />
        </div>

        <FilterBar title="Filtro rapido" description="Busque por nome, descricao ou status.">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <SearchInput
              placeholder="Ex.: fundacao, em andamento..."
              value={search}
              onChange={setSearch}
            />
          </div>
          <PersistenceNotice
            mode="hybrid"
            title="Persistencia deste modulo"
            description="A criacao usa o backend atual. Edicao e exclusao ainda sao refletidas localmente no navegador nesta fase."
          />
        </FilterBar>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Etapas cadastradas</h3>
            <p className="card-subtitle">{filteredStages.length} registro(s)</p>
          </div>
          <PersistenceBadge mode="hybrid" />
        </div>

        {filteredStages.length === 0 ? (
          <p>Nenhuma etapa encontrada.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Descricao</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredStages.map((stage) => (
                  <tr key={stage.id}>
                    <td>{stage.name}</td>
                    <td>{stage.description || "Sem descricao"}</td>
                    <td>
                      <span className={stageStatusClass(stage.status)}>{stageStatusLabel(stage.status)}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <PermissionGate permission="works.manage.update">
                          <button type="button" className="btn btn-secondary" onClick={() => setEditingStage(stage)}>
                            Editar
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="works.manage.delete">
                          <button type="button" className="btn btn-ghost" onClick={() => handleDelete(stage)}>
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
