"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useWork } from "@/features/works/context/WorkContext";
import { UserCreateForm, type UserCreateFormValues } from "@/features/users/components/UserCreateForm";
import { UserForm, type UserFormValues } from "@/features/users/components/UserForm";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/features/users/hooks/useUsers";
import type { UserDto } from "@/features/users/types/user.types";
import { PermissionGate } from "@/shared/components/auth/PermissionGate";
import { appendAuditEvent } from "@/shared/utils/auditLog";
import { parseApiError } from "@/shared/utils/apiError";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { usePageFeedback } from "@/shared/hooks/usePageFeedback";
import { FeedbackNotice } from "@/shared/components/common/FeedbackNotice";
import { PersistenceBadge } from "@/shared/components/common/PersistenceBadge";
import { FilterBar } from "@/shared/components/common/FilterBar";
import { LoadingState } from "@/shared/components/common/LoadingState";
import { ErrorState } from "@/shared/components/common/ErrorState";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { StatCard } from "@/shared/components/common/StatCard";

export default function UsuariosPage() {
  const { user: authUser } = useAuth();
  const { currentWork } = useWork();
  const { data: users = [], isLoading, isError, error } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const { feedback, showFeedback, clearFeedback } = usePageFeedback();
  const { requestConfirmation, dialog } = useConfirmDialog();

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    const base = users.filter((u) => {
      const fullName = u.fullName.toLowerCase();
      const email = u.email.toLowerCase();
      return fullName.includes(term) || email.includes(term);
    });

    if (statusFilter === "active") {
      return base.filter((u) => u.isActive);
    }

    if (statusFilter === "inactive") {
      return base.filter((u) => !u.isActive);
    }

    return base;
  }, [users, search, statusFilter]);

  const summary = useMemo(() => {
    const active = users.filter((u) => u.isActive).length;
    const inactive = Math.max(users.length - active, 0);
    return { total: users.length, active, inactive, filtered: filteredUsers.length };
  }, [users, filteredUsers.length]);

  const handleSaveUser = async (values: UserFormValues) => {
    if (!editingUser) return;

    clearFeedback();

    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        fullName: values.fullName.trim(),
        isActive: values.isActive,
      });

      showFeedback("Usuario atualizado com sucesso.", "success");
      appendAuditEvent({
        action: "Atualizacao",
        entity: "Usuario",
        details: values.fullName.trim(),
        level: "success",
      });
      setEditingUser(null);
    } catch (saveError) {
      showFeedback(parseApiError(saveError), "error");
      appendAuditEvent({
        action: "Falha ao atualizar",
        entity: "Usuario",
        details: parseApiError(saveError),
        level: "error",
      });
    }
  };

  const handleDeleteUser = async (target: UserDto) => {
    const me = authUser?.email?.toLowerCase();
    if (me && target.email.toLowerCase() === me) {
      showFeedback("Nao e permitido excluir o proprio usuario logado.", "warning");
      return;
    }

    requestConfirmation({
      title: "Excluir usuario",
      description: `Deseja remover o usuario "${target.fullName}"?`,
      confirmLabel: "Excluir usuario",
      tone: "danger",
      onConfirm: async () => {
        clearFeedback();

        try {
          await deleteUser.mutateAsync(target.id);
          if (editingUser?.id === target.id) {
            setEditingUser(null);
          }
          showFeedback("Usuario removido com sucesso.", "success");
          appendAuditEvent({
            action: "Exclusao",
            entity: "Usuario",
            details: target.email,
            level: "warning",
          });
        } catch (deleteError) {
          showFeedback(parseApiError(deleteError), "error");
          appendAuditEvent({
            action: "Falha ao excluir",
            entity: "Usuario",
            details: parseApiError(deleteError),
            level: "error",
          });
        }
      },
    });
  };

  const handleCreateUser = async (values: UserCreateFormValues) => {
    clearFeedback();

    try {
      await createUser.mutateAsync({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });

      showFeedback("Usuario criado com sucesso.", "success");
      appendAuditEvent({
        action: "Criacao",
        entity: "Usuario",
        details: values.email.trim(),
        level: "success",
      });
      return true;
    } catch (createError) {
      showFeedback(parseApiError(createError), "error");
      appendAuditEvent({
        action: "Falha ao criar",
        entity: "Usuario",
        details: parseApiError(createError),
        level: "error",
      });
      return false;
    }
  };

  return (
    <PageShell
      title="Usuarios"
      subtitle="Administracao de usuarios e governanca visual por obra ativa."
      requiredPermission="users.manage.update"
      requireActiveWork
    >
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="Usuarios totais" value={summary.total} helper="Listagem retornada pela API" />
        <StatCard label="Usuarios ativos" value={summary.active} helper="Com acesso operacional habilitado" />
        <StatCard label="Usuarios inativos" value={summary.inactive} helper="Sem operacao ativa no momento" />
        <StatCard label="Resultado do filtro" value={summary.filtered} helper="Busca + status aplicados" />
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Contexto da obra ativa</h3>
            <p className="card-subtitle">A administracao visual ocorre no escopo da obra selecionada.</p>
          </div>
          <PersistenceBadge mode="backend" />
        </div>
        <p style={{ margin: 0 }}>
          Obra ativa: <strong>{currentWork?.name ?? "Nenhuma"}</strong>. O backend atual de usuarios ainda retorna listagem global;
          nesta fase o frontend reforca o contexto visual da obra ativa para operacao segura.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Novo usuario</h3>
            <p className="card-subtitle">Cadastro operacional utilizando endpoint de registro.</p>
          </div>
          <PersistenceBadge mode="backend" />
        </div>

        <PermissionGate
          permission="users.manage.update"
          fallback={<p>Seu perfil atual nao possui permissao para cadastrar usuarios.</p>}
        >
          <UserCreateForm onSubmit={handleCreateUser} isSubmitting={createUser.isPending} />
        </PermissionGate>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Usuarios cadastrados</h3>
              <p className="card-subtitle">Listagem geral de usuarios (backend atual nao filtra por obra).</p>
            </div>
            <PersistenceBadge mode="backend" />
          </div>

          <FilterBar title="Filtros de usuarios" description="Busque por nome/e-mail e refine por status">
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <SearchInput placeholder="Buscar por nome ou e-mail" value={search} onChange={setSearch} />
              <select
                className="form-input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}
              >
                <option value="all">Todos os status</option>
                <option value="active">Somente ativos</option>
                <option value="inactive">Somente inativos</option>
              </select>
            </div>
          </FilterBar>

          {isLoading ? (
            <LoadingState title="Carregando usuarios" description="Consultando usuarios cadastrados no backend." />
          ) : isError ? (
            <ErrorState title="Falha ao carregar usuarios" description={parseApiError(error)} />
          ) : filteredUsers.length === 0 ? (
            <EmptyState title="Nenhum usuario encontrado" description="Ajuste os filtros ou cadastre um novo usuario." />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((row) => (
                    <tr key={row.id}>
                      <td>{row.fullName}</td>
                      <td>{row.email}</td>
                      <td>
                        <span className={row.isActive ? "badge badge-green" : "badge badge-orange"}>
                          {row.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <PermissionGate permission="users.manage.update">
                            <button className="btn btn-secondary" type="button" onClick={() => setEditingUser(row)}>
                              Editar
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="users.manage.delete">
                            <button
                              className="btn btn-ghost"
                              type="button"
                              onClick={() => handleDeleteUser(row)}
                              disabled={deleteUser.isPending}
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

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Edicao de usuario</h3>
              <p className="card-subtitle">Atualize nome e status do usuario selecionado.</p>
            </div>
            <PersistenceBadge mode="backend" />
          </div>

          <PermissionGate
            permission="users.manage.update"
            fallback={<p>Seu perfil atual nao possui permissao para editar usuarios.</p>}
          >
            <UserForm
              user={editingUser}
              isSubmitting={updateUser.isPending}
              onSubmit={handleSaveUser}
              onCancel={() => setEditingUser(null)}
            />
          </PermissionGate>

          <FeedbackNotice feedback={feedback} />
        </div>
      </div>
      {dialog}
    </PageShell>
  );
}
