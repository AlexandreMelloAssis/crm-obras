"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useWork } from "@/features/works/context/WorkContext";
import { WorkStatusBadge } from "@/features/works/components/WorkStatusBadge";
import { WorkForm, type WorkFormValues } from "@/features/works/components/WorkForm";
import { useCreateWork, useDeleteWork, useUpdateWork } from "@/features/works/hooks/useWorkCrud";
import type { WorkDto } from "@/features/works/types/work.types";
import { PermissionGate } from "@/shared/components/auth/PermissionGate";
import { parseApiError } from "@/shared/utils/apiError";
import { appendAuditEvent } from "@/shared/utils/auditLog";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterBar } from "@/shared/components/common/FilterBar";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { usePageFeedback } from "@/shared/hooks/usePageFeedback";
import { FeedbackNotice } from "@/shared/components/common/FeedbackNotice";
import { PersistenceBadge } from "@/shared/components/common/PersistenceBadge";
import { LoadingState } from "@/shared/components/common/LoadingState";
import { ErrorState } from "@/shared/components/common/ErrorState";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { StatCard } from "@/shared/components/common/StatCard";

export default function ObrasList() {
  const { works, currentWork, setCurrentWork, isLoading, loadError } = useWork();
  const createWork = useCreateWork();
  const updateWork = useUpdateWork();
  const deleteWork = useDeleteWork();

  const [search, setSearch] = useState("");
  const [editingWork, setEditingWork] = useState<WorkDto | null>(null);
  const { feedback, showFeedback, clearFeedback } = usePageFeedback();
  const { requestConfirmation, dialog } = useConfirmDialog();

  const filteredWorks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return works;

    return works.filter((work) => {
      const name = work.name?.toLowerCase() ?? "";
      const address = work.address?.toLowerCase() ?? "";
      const status = work.status?.toLowerCase() ?? "";
      return name.includes(term) || address.includes(term) || status.includes(term);
    });
  }, [works, search]);

  const summary = useMemo(() => {
    const completed = works.filter((work) => work.status?.toLowerCase().includes("concl")).length;
    const inProgress = works.filter((work) => {
      const status = work.status?.toLowerCase() ?? "";
      return status.includes("progress") || status.includes("exec") || status.includes("andamento") || status.includes("ativo");
    }).length;
    const pending = Math.max(works.length - completed - inProgress, 0);

    return { completed, inProgress, pending };
  }, [works]);

  const handleCreateWork = async (values: WorkFormValues) => {
    clearFeedback();

    try {
      await createWork.mutateAsync({
        name: values.name.trim(),
        address: values.address.trim(),
      });

      showFeedback("Obra criada com sucesso.", "success");
      appendAuditEvent({
        action: "Criacao",
        entity: "Obra",
        details: values.name.trim(),
        level: "success",
      });
      return true;
    } catch (error) {
      const message = parseApiError(error, "Erro ao criar obra");
      showFeedback(message, "error");
      appendAuditEvent({
        action: "Falha ao criar",
        entity: "Obra",
        details: message,
        level: "error",
      });
      return false;
    }
  };

  const handleUpdateWork = async (values: WorkFormValues) => {
    if (!editingWork) return;

    clearFeedback();

    try {
      await updateWork.mutateAsync({
        id: editingWork.id,
        name: values.name.trim(),
        address: values.address.trim(),
        status: values.status,
      });

      showFeedback("Obra atualizada com sucesso.", "success");
      appendAuditEvent({
        action: "Atualizacao",
        entity: "Obra",
        details: values.name.trim(),
        level: "success",
      });
      setEditingWork(null);
      return true;
    } catch (error) {
      const message = parseApiError(error, "Erro ao atualizar obra");
      showFeedback(message, "error");
      appendAuditEvent({
        action: "Falha ao atualizar",
        entity: "Obra",
        details: message,
        level: "error",
      });
      return false;
    }
  };

  const handleDeleteWork = async (work: WorkDto) => {
    requestConfirmation({
      title: "Excluir obra",
      description: `Deseja excluir a obra "${work.name}"?`,
      confirmLabel: "Excluir obra",
      tone: "danger",
      onConfirm: async () => {
        clearFeedback();

        try {
          await deleteWork.mutateAsync(work.id);

          if (editingWork?.id === work.id) {
            setEditingWork(null);
          }

          showFeedback("Obra excluida com sucesso.", "success");
          appendAuditEvent({
            action: "Exclusao",
            entity: "Obra",
            details: work.name,
            level: "warning",
          });
        } catch (error) {
          const message = parseApiError(error, "Erro ao excluir obra");
          showFeedback(message, "error");
          appendAuditEvent({
            action: "Falha ao excluir",
            entity: "Obra",
            details: message,
            level: "error",
          });
        }
      },
    });
  };

  return (
    <PageShell
      title="Minhas Obras"
      subtitle="Visualize e selecione a obra ativa para as operacoes do sistema."
      requiredPermission="works.select.view"
    >
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="Obras autorizadas" value={works.length} helper="Somente obras permitidas para seu usuario" />
        <StatCard label="Em andamento" value={summary.inProgress} helper="Execucao ativa no momento" />
        <StatCard label="Concluidas" value={summary.completed} helper="Obras finalizadas" />
        <StatCard label="Pendentes" value={summary.pending} helper="Aguardando inicio ou atualizacao" />
      </div>

      <div className="two-col" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{editingWork ? "Editar obra" : "Nova obra"}</h3>
              <p className="card-subtitle">
                {editingWork ? "Atualize dados cadastrais da obra." : "Cadastre uma nova obra para o time."}
              </p>
            </div>
            <PersistenceBadge mode="backend" />
          </div>

          <PermissionGate permission="works.manage.update" fallback={<p>Sem permissao para gerenciar obras.</p>}>
            <WorkForm
              initialValues={editingWork}
              onSubmit={editingWork ? handleUpdateWork : handleCreateWork}
              onCancel={editingWork ? () => setEditingWork(null) : undefined}
              isSubmitting={createWork.isPending || updateWork.isPending}
              submitLabel={editingWork ? "Salvar alteracoes" : "Cadastrar obra"}
              includeStatus={Boolean(editingWork)}
              resetOnSuccess={!editingWork}
            />
          </PermissionGate>

          <FeedbackNotice feedback={feedback} />
        </div>

        <FilterBar title="Filtro rapido" description="Busque por nome, endereco ou status">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <SearchInput
              placeholder="Ex.: Vila Mariana, concluida, residencial..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </FilterBar>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Obras com acesso</h3>
            <p className="card-subtitle">Somente obras autorizadas para seu usuario</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <PersistenceBadge mode="backend" />
            <span className="badge badge-blue">{filteredWorks.length} registros</span>
          </div>
        </div>

        {isLoading ? (
          <LoadingState title="Carregando obras" description="Consultando as obras com acesso para o seu usuario." />
        ) : loadError ? (
          <ErrorState title="Falha ao carregar obras" description={loadError} />
        ) : filteredWorks.length === 0 ? (
          <EmptyState
            title="Nenhuma obra encontrada"
            description="Ajuste os filtros ou cadastre uma nova obra para continuar."
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Obra</th>
                  <th>Endereco</th>
                  <th>Status</th>
                  <th>Obra ativa</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorks.map((work) => {
                  const isActive = currentWork?.id === work.id;
                  return (
                    <tr key={work.id}>
                      <td>{work.name}</td>
                      <td>{work.address || "Sem endereco"}</td>
                      <td>
                        <WorkStatusBadge work={work} />
                      </td>
                      <td>{isActive ? <span className="badge badge-green">Ativa</span> : <span className="badge">-</span>}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {!isActive ? (
                            <button type="button" className="btn btn-secondary" onClick={() => setCurrentWork(work.id)}>
                              Tornar ativa
                            </button>
                          ) : null}
                          <PermissionGate permission="works.manage.update">
                            <button type="button" className="btn btn-secondary" onClick={() => setEditingWork(work)}>
                              Editar
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="works.manage.delete">
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => handleDeleteWork(work)}
                              disabled={deleteWork.isPending}
                            >
                              Excluir
                            </button>
                          </PermissionGate>
                          <Link href={`/obras/${work.id}`} className="btn btn-primary">
                            Detalhes
                          </Link>
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
