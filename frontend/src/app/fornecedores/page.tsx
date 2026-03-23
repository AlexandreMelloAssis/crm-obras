"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SupplierForm, type SupplierFormValues } from "@/features/suppliers/components/SupplierForm";
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from "@/features/suppliers/hooks/useSuppliers";
import type { SupplierDto } from "@/features/suppliers/types/supplier.types";
import { PermissionGate } from "@/shared/components/auth/PermissionGate";
import { appendAuditEvent } from "@/shared/utils/auditLog";
import { parseApiError } from "@/shared/utils/apiError";
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

export default function SuppliersPage() {
  const { data: suppliers = [], isLoading, isError, error } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const [search, setSearch] = useState("");
  const [editingSupplier, setEditingSupplier] = useState<SupplierDto | null>(null);
  const { feedback, showFeedback, clearFeedback } = usePageFeedback();
  const { requestConfirmation, dialog } = useConfirmDialog();

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return suppliers;

    return suppliers.filter((supplier) => {
      const name = supplier.name.toLowerCase();
      const contact = supplier.contact?.toLowerCase() ?? "";
      return name.includes(term) || contact.includes(term);
    });
  }, [suppliers, search]);

  const summary = useMemo(() => {
    const withContact = suppliers.filter((supplier) => Boolean(supplier.contact?.trim())).length;
    const withoutContact = Math.max(suppliers.length - withContact, 0);
    return {
      total: suppliers.length,
      withContact,
      withoutContact,
      filtered: filteredSuppliers.length,
    };
  }, [suppliers, filteredSuppliers.length]);

  const handleCreate = async (values: SupplierFormValues) => {
    clearFeedback();
    try {
      await createSupplier.mutateAsync({
        name: values.name.trim(),
        contact: values.contact?.trim() || undefined,
      });
      showFeedback("Fornecedor criado com sucesso.", "success");
      appendAuditEvent({
        action: "Criacao",
        entity: "Fornecedor",
        details: values.name.trim(),
        level: "success",
      });
      return true;
    } catch (createError) {
      showFeedback(parseApiError(createError), "error");
      appendAuditEvent({
        action: "Falha ao criar",
        entity: "Fornecedor",
        details: parseApiError(createError),
        level: "error",
      });
      return false;
    }
  };

  const handleUpdate = async (values: SupplierFormValues) => {
    if (!editingSupplier) return;

    clearFeedback();
    try {
      await updateSupplier.mutateAsync({
        id: editingSupplier.id,
        name: values.name.trim(),
        contact: values.contact?.trim() || undefined,
      });
      showFeedback("Fornecedor atualizado com sucesso.", "success");
      appendAuditEvent({
        action: "Atualizacao",
        entity: "Fornecedor",
        details: values.name.trim(),
        level: "success",
      });
      setEditingSupplier(null);
      return true;
    } catch (updateError) {
      showFeedback(parseApiError(updateError), "error");
      appendAuditEvent({
        action: "Falha ao atualizar",
        entity: "Fornecedor",
        details: parseApiError(updateError),
        level: "error",
      });
      return false;
    }
  };

  const handleDelete = async (supplier: SupplierDto) => {
    requestConfirmation({
      title: "Excluir fornecedor",
      description: `Deseja excluir o fornecedor "${supplier.name}"?`,
      confirmLabel: "Excluir fornecedor",
      tone: "danger",
      onConfirm: async () => {
        clearFeedback();
        try {
          await deleteSupplier.mutateAsync(supplier.id);
          if (editingSupplier?.id === supplier.id) {
            setEditingSupplier(null);
          }
          showFeedback("Fornecedor excluido com sucesso.", "success");
          appendAuditEvent({
            action: "Exclusao",
            entity: "Fornecedor",
            details: supplier.name,
            level: "warning",
          });
        } catch (deleteError) {
          showFeedback(parseApiError(deleteError), "error");
          appendAuditEvent({
            action: "Falha ao excluir",
            entity: "Fornecedor",
            details: parseApiError(deleteError),
            level: "error",
          });
        }
      },
    });
  };

  return (
    <PageShell
      title="Fornecedores"
      subtitle="Cadastro e manutencao de fornecedores vinculados as obras."
      requiredPermission="suppliers.manage.view"
    >
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="Total de fornecedores" value={summary.total} helper="Registros vinculados ao seu acesso" />
        <StatCard label="Com contato" value={summary.withContact} helper="Prontos para cotacao e comunicacao" />
        <StatCard label="Sem contato" value={summary.withoutContact} helper="Necessitam complemento cadastral" />
        <StatCard label="Resultado do filtro" value={summary.filtered} helper="Aplicado no campo de busca" />
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{editingSupplier ? "Editar fornecedor" : "Novo fornecedor"}</h3>
              <p className="card-subtitle">
                {editingSupplier ? "Atualize os dados do fornecedor selecionado." : "Cadastre fornecedores para futuras cotacoes."}
              </p>
            </div>
            <PersistenceBadge mode="backend" />
          </div>

          <PermissionGate permission="suppliers.manage.write" fallback={<p>Sem permissao para gerenciar fornecedores.</p>}>
            <SupplierForm
              initialValues={editingSupplier}
              onSubmit={editingSupplier ? handleUpdate : handleCreate}
              onCancel={editingSupplier ? () => setEditingSupplier(null) : undefined}
              isSubmitting={createSupplier.isPending || updateSupplier.isPending}
              submitLabel={editingSupplier ? "Salvar alteracoes" : "Cadastrar fornecedor"}
              resetOnSuccess={!editingSupplier}
            />
          </PermissionGate>

          <FeedbackNotice feedback={feedback} />
        </div>

        <FilterBar title="Filtro rapido" description="Busque por nome ou contato.">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <SearchInput
              placeholder="Ex.: Construmax, (11) 99999-9999"
              value={search}
              onChange={setSearch}
            />
          </div>
        </FilterBar>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Lista de fornecedores</h3>
            <p className="card-subtitle">{filteredSuppliers.length} resultado(s)</p>
          </div>
          <PersistenceBadge mode="backend" />
        </div>

        {isLoading ? (
          <LoadingState title="Carregando fornecedores" description="Consultando os fornecedores com acesso para sua conta." />
        ) : isError ? (
          <ErrorState title="Falha ao carregar fornecedores" description={parseApiError(error)} />
        ) : filteredSuppliers.length === 0 ? (
          <EmptyState
            title="Nenhum fornecedor encontrado"
            description="Ajuste o filtro ou cadastre um novo fornecedor para continuar."
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.name}</td>
                    <td>{supplier.contact || "Nao informado"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <PermissionGate permission="suppliers.manage.update">
                          <button type="button" className="btn btn-secondary" onClick={() => setEditingSupplier(supplier)}>
                            Editar
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="suppliers.manage.delete">
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => handleDelete(supplier)}
                            disabled={deleteSupplier.isPending}
                          >
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
