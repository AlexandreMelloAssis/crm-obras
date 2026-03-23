"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageShell } from "@/components/PageShell";
import { useWork } from "@/features/works/context/WorkContext";
import { useDocumentCategories, useUploadDocument } from "@/features/documents/hooks/useDocuments";
import type { DocumentCategoryOption, SavedDocumentCategory, UploadedDocumentLocal } from "@/features/documents/types/document.types";
import { DocumentAnalysisPanel } from "@/features/documents/components/DocumentAnalysisPanel";
import { PermissionGate } from "@/shared/components/auth/PermissionGate";
import { appendAuditEvent } from "@/shared/utils/auditLog";
import { parseApiError } from "@/shared/utils/apiError";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { usePageFeedback } from "@/shared/hooks/usePageFeedback";
import { FeedbackNotice } from "@/shared/components/common/FeedbackNotice";
import { PersistenceBadge, PersistenceNotice } from "@/shared/components/common/PersistenceBadge";
import { FileUploader } from "@/shared/components/common/FileUploader";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterBar } from "@/shared/components/common/FilterBar";
import { LoadingState } from "@/shared/components/common/LoadingState";
import { ErrorState } from "@/shared/components/common/ErrorState";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { StatCard } from "@/shared/components/common/StatCard";

const documentFormSchema = z.object({
  categoryId: z.string().uuid("Informe um CategoryId valido (UUID)."),
  file: z
    .any()
    .refine((value) => value instanceof FileList && value.length > 0, "Selecione um arquivo."),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

export default function DocumentosPage() {
  const { currentWork } = useWork();
  const uploadDocument = useUploadDocument();
  const documentCategories = useDocumentCategories();
  const { feedback, showFeedback, clearFeedback } = usePageFeedback();
  const [uploadedItems, setUploadedItems] = useLocalStorage<UploadedDocumentLocal[]>("crm-obras:documents-local", []);
  const [savedCategories, setSavedCategories] = useLocalStorage<SavedDocumentCategory[]>("crm-obras:documents-categories", []);
  const [search, setSearch] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>();
  const { requestConfirmation, dialog } = useConfirmDialog();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      categoryId: "",
    },
  });

  const watchedCategoryId = watch("categoryId");

  const categoriesById = useMemo(
    () => new Map(documentCategories.data?.map((item) => [item.id, item]) ?? []),
    [documentCategories.data]
  );

  const selectedCategory = watchedCategoryId ? categoriesById.get(watchedCategoryId) : undefined;

  const savedCategoryOptions = useMemo(
    () => [...savedCategories].sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()),
    [savedCategories]
  );

  const onSubmit = async (values: DocumentFormValues) => {
    if (!currentWork) return;

    clearFeedback();

    try {
      const file = values.file[0] as File;
      const category = categoriesById.get(values.categoryId);
      const id = await uploadDocument.mutateAsync({
        workId: currentWork.id,
        categoryId: values.categoryId,
        file,
      });

      setUploadedItems((prev) => [
        {
          id,
          workId: currentWork.id,
          categoryLabel: category?.name ?? "",
          categoryId: values.categoryId,
          workflow: category?.workflow,
          fileName: file.name,
          uploadedAt: new Date().toLocaleString("pt-BR"),
        },
        ...prev,
      ]);

      setSavedCategories((prev) => {
        const nextItem: SavedDocumentCategory = {
          label: category?.name ?? values.categoryId,
          categoryId: values.categoryId,
          lastUsedAt: new Date().toISOString(),
        };

        const filtered = prev.filter(
          (item) =>
            item.categoryId !== nextItem.categoryId &&
            item.label.trim().toLowerCase() !== nextItem.label.trim().toLowerCase()
        );

        return [nextItem, ...filtered].slice(0, 12);
      });

      showFeedback(`Arquivo enviado com sucesso em ${category?.name ?? "categoria selecionada"}. ID: ${id}`, "success");
      appendAuditEvent({
        action: "Upload",
        entity: "Documento",
        details: `${file.name} (${category?.name ?? values.categoryId})`,
        level: "success",
      });
      reset({
        categoryId: values.categoryId,
        file: undefined as unknown as FileList,
      });
      setSelectedFileName(undefined);
    } catch (error) {
      showFeedback(parseApiError(error, "Erro no upload"), "error");
      appendAuditEvent({
        action: "Falha no upload",
        entity: "Documento",
        details: parseApiError(error, "Erro no upload"),
        level: "error",
      });
    }
  };

  const workUploads = useMemo(
    () => uploadedItems.filter((item) => item.workId === currentWork?.id),
    [uploadedItems, currentWork?.id]
  );
  const filteredUploads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return workUploads;
    return workUploads.filter((item) => {
      const fileName = item.fileName.toLowerCase();
      const category = (item.categoryLabel || item.categoryId).toLowerCase();
      return fileName.includes(term) || category.includes(term);
    });
  }, [workUploads, search]);

  const applySavedCategory = (item: SavedDocumentCategory) => {
    setValue("categoryId", item.categoryId, { shouldDirty: true, shouldValidate: true });
  };

  const removeSavedCategory = (item: SavedDocumentCategory) => {
    requestConfirmation({
      title: "Remover categoria salva",
      description: `Deseja remover o atalho local "${item.label}"?`,
      confirmLabel: "Remover atalho",
      tone: "danger",
      onConfirm: () => {
        setSavedCategories((prev) => prev.filter((entry) => entry.categoryId !== item.categoryId));
        showFeedback("Atalho de categoria removido.", "success");
      },
    });
  };

  const removeUploadLocal = (id: string) => {
    const target = workUploads.find((item) => item.id === id);
    if (!target) return;

    requestConfirmation({
      title: "Remover registro local",
      description: `Deseja remover o registro local do arquivo "${target.fileName}"?`,
      confirmLabel: "Remover registro",
      tone: "danger",
      onConfirm: () => {
        setUploadedItems((prev) => prev.filter((item) => item.id !== id));
        showFeedback("Registro local de documento removido.", "success");
      },
    });
  };

  if (!currentWork) {
    return (
      <PageShell
        title="Documentos"
        subtitle="Selecione uma obra ativa para anexar documentos."
        requiredPermission="documents.manage.view"
      >
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Nenhuma obra ativa</h3>
              <p className="card-subtitle">Escolha uma obra antes de enviar anexos.</p>
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
      title="Documentos"
      subtitle={`Upload de anexos da obra ativa: ${currentWork.name}.`}
      requiredPermission="documents.manage.view"
    >
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="Uploads da obra ativa" value={workUploads.length} helper="Registros locais da sessao" />
        <StatCard label="Categorias salvas" value={savedCategoryOptions.length} helper="Atalhos de categoria para upload" />
        <StatCard label="Categorias da API" value={documentCategories.data?.length ?? 0} helper="Disponiveis no backend" />
        <StatCard label="Resultado do filtro" value={filteredUploads.length} helper="Aplicado na lista de uploads" />
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Enviar documento</h3>
              <p className="card-subtitle">Notas, orcamentos, plantas e anexos operacionais.</p>
            </div>
            <PersistenceBadge mode="backend" />
          </div>

          <PermissionGate permission="documents.manage.upload" fallback={<p>Sem permissao para enviar documentos.</p>}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label" htmlFor="category-id">Categoria do documento</label>
                <select
                  id="category-id"
                  className="form-input"
                  {...register("categoryId")}
                  disabled={documentCategories.isLoading || !documentCategories.data?.length}
                >
                  <option value="">Selecione a categoria operacional</option>
                  {(documentCategories.data ?? []).map((item: DocumentCategoryOption) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.workflow}
                    </option>
                  ))}
                </select>
                {errors.categoryId ? <p className="field-error">{errors.categoryId.message}</p> : null}
                {selectedCategory ? (
                  <p className="card-subtitle" style={{ marginTop: "0.5rem" }}>
                    Tipo: <strong>{selectedCategory.type}</strong> | Encaminhamento: <strong>{selectedCategory.workflow}</strong>
                  </p>
                ) : null}
                {documentCategories.isError ? (
                  <p className="field-error">{parseApiError(documentCategories.error, "Nao foi possivel carregar as categorias de documento.")}</p>
                ) : null}
              </div>

              {savedCategoryOptions.length > 0 ? (
                <div className="form-group">
                  <label className="form-label">Categorias salvas</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {savedCategoryOptions.map((item) => {
                      const isActive = watchedCategoryId === item.categoryId;

                      return (
                        <div key={`${item.categoryId}-${item.label}`} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                          <button
                            type="button"
                            className={`btn ${isActive ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => applySavedCategory(item)}
                          >
                            {item.label}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => removeSavedCategory(item)}
                            aria-label={`Remover categoria ${item.label}`}
                          >
                            x
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="form-group">
                <label className="form-label" htmlFor="doc-file">Arquivo</label>
                <input id="doc-file-hidden" type="file" style={{ display: "none" }} {...register("file")} />
                <FileUploader
                  id="doc-file"
                  disabled={uploadDocument.isPending}
                  selectedFileName={selectedFileName}
                  onFileSelect={(file) => {
                    if (!file) {
                      setValue("file", undefined as unknown as FileList, { shouldValidate: true });
                      setSelectedFileName(undefined);
                      return;
                    }

                    const transfer = new DataTransfer();
                    transfer.items.add(file);
                    setValue("file", transfer.files, { shouldDirty: true, shouldValidate: true });
                    setSelectedFileName(file.name);
                  }}
                />
                {errors.file ? <p className="field-error">{errors.file.message as string}</p> : null}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-primary" disabled={uploadDocument.isPending}>
                  {uploadDocument.isPending ? "Enviando..." : "Enviar documento"}
                </button>
              </div>
            </form>
          </PermissionGate>

          <FeedbackNotice feedback={feedback} />
          <PersistenceNotice
            mode="hybrid"
            title="Persistencia deste modulo"
            description="O arquivo e enviado ao backend. Os metadados de conferencia rapida e os atalhos de categoria ficam salvos localmente neste navegador."
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Observacoes de integracao</h3>
              <p className="card-subtitle">Contrato atual do backend para upload</p>
            </div>
            <PersistenceBadge mode="backend" />
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.625rem" }}>
            <li>Categorias reais carregadas do backend em <strong>GET /documents/categories</strong></li>
            <li>Endpoint: <strong>POST /documents/upload</strong></li>
            <li>Campos obrigatorios: <strong>workId</strong>, <strong>categoryId</strong>, <strong>file</strong></li>
            <li>Voce pode salvar atalhos locais de categoria para reutilizar filtros e fluxos mais frequentes.</li>
            <li>As categorias foram organizadas para obra: projetos tecnicos, orcamentos, notas e comprovantes.</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Ultimos uploads (sessao atual)</h3>
            <p className="card-subtitle">Registro local para conferencia rapida</p>
          </div>
          <PersistenceBadge mode="local" />
        </div>

        <FilterBar title="Filtro de uploads" description="Busque por nome de arquivo, categoria ou categoryId">
          <SearchInput
            placeholder="Ex.: nota fiscal, projeto, orcamento..."
            value={search}
            onChange={setSearch}
          />
        </FilterBar>

        {documentCategories.isLoading ? (
          <LoadingState title="Carregando dados de documentos" description="Consultando categorias e uploads da obra ativa." />
        ) : documentCategories.isError ? (
          <ErrorState title="Falha ao carregar categorias" description={parseApiError(documentCategories.error)} />
        ) : filteredUploads.length === 0 ? (
          <EmptyState
            title="Nenhum upload encontrado"
            description={workUploads.length === 0 ? "Nenhum upload realizado nesta sessao." : "Nenhum resultado para o filtro aplicado."}
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Categoria</th>
                  <th>CategoriaId</th>
                  <th>ID</th>
                  <th>Data/Hora</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredUploads.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fileName}</td>
                    <td>{item.categoryLabel || "-"}</td>
                    <td>{item.categoryId}</td>
                    <td>{item.id}</td>
                    <td>{item.uploadedAt}</td>
                    <td>
                      <PermissionGate permission="documents.manage.upload">
                        <button type="button" className="btn btn-ghost" onClick={() => removeUploadLocal(item.id)}>
                          Excluir
                        </button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DocumentAnalysisPanel
        workId={currentWork.id}
        uploads={workUploads}
        categories={documentCategories.data ?? []}
      />
      {dialog}
    </PageShell>
  );
}
