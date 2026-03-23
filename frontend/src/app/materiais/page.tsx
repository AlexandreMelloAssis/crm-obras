"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { MaterialForm, type MaterialFormValues } from "@/features/materials/components/MaterialForm";
import { useCreateMaterial, useMaterials } from "@/features/materials/hooks/useMaterials";
import type { DocumentMaterialSuggestion } from "@/features/documents/types/document.types";
import { useWork } from "@/features/works/context/WorkContext";
import { PermissionGate } from "@/shared/components/auth/PermissionGate";
import { appendAuditEvent } from "@/shared/utils/auditLog";
import { parseApiError } from "@/shared/utils/apiError";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterBar } from "@/shared/components/common/FilterBar";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { usePageFeedback } from "@/shared/hooks/usePageFeedback";
import { FeedbackNotice } from "@/shared/components/common/FeedbackNotice";
import { PersistenceBadge, PersistenceNotice } from "@/shared/components/common/PersistenceBadge";

type MaterialEditRecord = {
  name: string;
  unit: string;
  category: number;
};

type MaterialView = {
  id: string;
  name: string;
  unit: string;
  category: string;
  categoryValue: number;
};

const categoryLabels: Record<string, string> = {
  Structural: "Estrutural",
  Finishing: "Acabamento",
  Electrical: "Eletrica",
  Hydraulic: "Hidraulica",
  Tools: "Ferramentas",
};

const categoryToValue: Record<string, number> = {
  Structural: 1,
  Finishing: 2,
  Electrical: 3,
  Hydraulic: 4,
  Tools: 5,
};

const valueToCategory: Record<number, string> = {
  1: "Structural",
  2: "Finishing",
  3: "Electrical",
  4: "Hydraulic",
  5: "Tools",
};

export default function MateriaisList() {
  const { currentWork } = useWork();
  const { data: materials = [], isLoading, isError, error } = useMaterials();
  const createMaterial = useCreateMaterial();

  const [search, setSearch] = useState("");
  const { feedback, showFeedback, clearFeedback } = usePageFeedback();
  const [editingMaterial, setEditingMaterial] = useState<MaterialView | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<DocumentMaterialSuggestion | null>(null);
  const [localEdits, setLocalEdits] = useLocalStorage<Record<string, MaterialEditRecord>>("crm-obras:materials-edits", {});
  const [localDeletedIds, setLocalDeletedIds] = useLocalStorage<string[]>("crm-obras:materials-deleted", []);
  const [materialSuggestions, setMaterialSuggestions] = useLocalStorage<DocumentMaterialSuggestion[]>("crm-obras:materials-imports", []);
  const { requestConfirmation, dialog } = useConfirmDialog();

  const workSuggestions = useMemo(
    () => materialSuggestions.filter((item) => item.workId === currentWork?.id),
    [materialSuggestions, currentWork?.id]
  );

  const visibleMaterials = useMemo(() => {
    return materials
      .filter((item) => !localDeletedIds.includes(item.id))
      .map((item): MaterialView => {
        const localEdit = localEdits[item.id];
        const originalCategoryValue = categoryToValue[item.category] ?? 1;
        const categoryValue = localEdit?.category ?? originalCategoryValue;
        const categoryKey = valueToCategory[categoryValue] ?? item.category;

        return {
          id: item.id,
          name: localEdit?.name ?? item.name,
          unit: localEdit?.unit ?? item.unit,
          category: categoryKey,
          categoryValue,
        };
      });
  }, [materials, localDeletedIds, localEdits]);

  const filteredMaterials = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return visibleMaterials;

    return visibleMaterials.filter((item) => {
      const name = item.name.toLowerCase();
      const unit = item.unit.toLowerCase();
      const category = item.category.toLowerCase();
      return name.includes(term) || unit.includes(term) || category.includes(term);
    });
  }, [visibleMaterials, search]);

  const handleCreateMaterial = async (values: MaterialFormValues) => {
    clearFeedback();

    try {
      await createMaterial.mutateAsync({
        name: values.name.trim(),
        unit: values.unit.trim(),
        category: values.category,
      });

      if (selectedSuggestion) {
        setMaterialSuggestions((prev) => prev.filter((item) => item.id !== selectedSuggestion.id));
        setSelectedSuggestion(null);
      }

      showFeedback("Material cadastrado com sucesso.", "success");
      appendAuditEvent({
        action: "Criacao",
        entity: "Material",
        details: values.name.trim(),
        level: "success",
      });
      return true;
    } catch (createError) {
      const message = parseApiError(createError, "Erro ao cadastrar material");
      showFeedback(message, "error");
      appendAuditEvent({
        action: "Falha ao criar",
        entity: "Material",
        details: message,
        level: "error",
      });
      return false;
    }
  };

  const handleUpdateMaterial = async (values: MaterialFormValues) => {
    if (!editingMaterial) return;

    clearFeedback();
    setLocalEdits((prev) => ({
      ...prev,
      [editingMaterial.id]: {
        name: values.name.trim(),
        unit: values.unit.trim(),
        category: values.category,
      },
    }));
    setEditingMaterial(null);
    showFeedback("Material atualizado na camada de frontend.", "info");
    appendAuditEvent({
      action: "Atualizacao",
      entity: "Material",
      details: values.name.trim(),
      level: "info",
    });
    return true;
  };

  const handleDeleteMaterial = (material: MaterialView) => {
    requestConfirmation({
      title: "Excluir material",
      description: `Deseja excluir o material "${material.name}"?`,
      confirmLabel: "Excluir material",
      tone: "danger",
      onConfirm: () => {
        setLocalDeletedIds((prev) => (prev.includes(material.id) ? prev : [...prev, material.id]));
        showFeedback("Material excluido na camada de frontend.", "success");
        appendAuditEvent({
          action: "Exclusao",
          entity: "Material",
          details: material.name,
          level: "warning",
        });
      },
    });
  };

  const discardSuggestion = (suggestion: DocumentMaterialSuggestion) => {
    requestConfirmation({
      title: "Descartar sugestao",
      description: `Deseja remover a sugestao "${suggestion.name}" importada do documento "${suggestion.sourceFileName}"?`,
      confirmLabel: "Descartar",
      tone: "danger",
      onConfirm: () => {
        setMaterialSuggestions((prev) => prev.filter((item) => item.id !== suggestion.id));
        if (selectedSuggestion?.id === suggestion.id) {
          setSelectedSuggestion(null);
        }
        showFeedback("Sugestao descartada.", "success");
      },
    });
  };

  return (
    <PageShell
      title="Materiais"
      subtitle="Cadastro e listagem do catalogo de materiais da operacao."
      requiredPermission="works.manage.view"
    >
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{editingMaterial ? "Editar material" : "Novo material"}</h3>
              <p className="card-subtitle">
                {editingMaterial
                  ? "Atualize os dados do material selecionado."
                  : selectedSuggestion
                    ? `Revise a sugestao importada do documento ${selectedSuggestion.sourceFileName}.`
                    : "Cadastre insumos para custos e cotacoes."}
              </p>
            </div>
            <PersistenceBadge mode={editingMaterial ? "local" : selectedSuggestion ? "hybrid" : "backend"} />
          </div>

          <PermissionGate permission="works.manage.update" fallback={<p>Sem permissao para cadastrar materiais.</p>}>
            <MaterialForm
              initialValues={
                editingMaterial
                  ? {
                      id: editingMaterial.id,
                      name: editingMaterial.name,
                      unit: editingMaterial.unit,
                      category: editingMaterial.categoryValue,
                    }
                  : selectedSuggestion
                    ? {
                        name: selectedSuggestion.name,
                        unit: selectedSuggestion.unit,
                        category: selectedSuggestion.category,
                      }
                  : null
              }
              onSubmit={editingMaterial ? handleUpdateMaterial : handleCreateMaterial}
              onCancel={
                editingMaterial
                  ? () => setEditingMaterial(null)
                  : selectedSuggestion
                    ? () => setSelectedSuggestion(null)
                    : undefined
              }
              isSubmitting={createMaterial.isPending}
              submitLabel={editingMaterial ? "Salvar alteracoes" : selectedSuggestion ? "Cadastrar a partir da sugestao" : "Cadastrar material"}
              resetOnSuccess={!editingMaterial && !selectedSuggestion}
            />
          </PermissionGate>

          <FeedbackNotice feedback={feedback} />
        </div>

        <FilterBar title="Filtro rapido" description="Busque por nome, unidade ou categoria.">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <SearchInput
              placeholder="Ex.: cimento, m2, eletrica"
              value={search}
              onChange={setSearch}
            />
          </div>
          <PersistenceNotice
            mode="hybrid"
            title="Persistencia deste modulo"
            description="Criacao e listagem usam o backend atual. Edicao e exclusao ainda sao mantidas localmente no navegador nesta fase."
          />
        </FilterBar>
      </div>

      {workSuggestions.length > 0 ? (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Sugestoes vindas de documentos</h3>
              <p className="card-subtitle">Itens extraidos de plantas e memoriais para revisao antes do cadastro.</p>
            </div>
            <PersistenceBadge mode="hybrid" />
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Material sugerido</th>
                  <th>Quantidade</th>
                  <th>Unidade</th>
                  <th>Categoria</th>
                  <th>Documento</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {workSuggestions.map((suggestion) => (
                  <tr key={suggestion.id}>
                    <td>{suggestion.name}</td>
                    <td>{suggestion.quantity ?? "-"}</td>
                    <td>{suggestion.unit}</td>
                    <td>{categoryLabels[valueToCategory[suggestion.category] ?? ""] || suggestion.category}</td>
                    <td>{suggestion.sourceFileName}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button type="button" className="btn btn-secondary" onClick={() => { setEditingMaterial(null); setSelectedSuggestion(suggestion); }}>
                          Usar no formulario
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => discardSuggestion(suggestion)}>
                          Descartar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Materiais cadastrados</h3>
            <p className="card-subtitle">{filteredMaterials.length} registro(s)</p>
          </div>
          <PersistenceBadge mode="hybrid" />
        </div>

        {isLoading ? (
          <p>Carregando materiais...</p>
        ) : isError ? (
          <FeedbackNotice feedback={{ message: parseApiError(error), tone: "error" }} />
        ) : filteredMaterials.length === 0 ? (
          <p>Nenhum material encontrado.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unidade</th>
                  <th>Categoria</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.unit}</td>
                    <td>{categoryLabels[item.category] || item.category}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <PermissionGate permission="works.manage.update">
                          <button type="button" className="btn btn-secondary" onClick={() => setEditingMaterial(item)}>
                            Editar
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="works.manage.delete">
                          <button type="button" className="btn btn-ghost" onClick={() => handleDeleteMaterial(item)}>
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

