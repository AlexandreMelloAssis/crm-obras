"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { useWork } from "@/features/works/context/WorkContext";
import { PermissionGate } from "@/shared/components/auth/PermissionGate";
import { QuotationComparisonTable, type QuotationOffer } from "@/shared/components/common/QuotationComparisonTable";
import { appendAuditEvent } from "@/shared/utils/auditLog";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { usePageFeedback } from "@/shared/hooks/usePageFeedback";
import { FeedbackNotice } from "@/shared/components/common/FeedbackNotice";
import { PersistenceBadge, PersistenceNotice } from "@/shared/components/common/PersistenceBadge";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterBar } from "@/shared/components/common/FilterBar";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { StatCard } from "@/shared/components/common/StatCard";

type QuotationRecord = {
  id: string;
  workId: string;
  title: string;
  itemDescription: string;
  status: "Rascunho" | "Enviada" | "Em analise" | "Concluida";
  offers: QuotationOffer[];
  justification?: string;
  history: string[];
};

const STORAGE_KEY = "crm-obras:quotations-local";

function loadQuotations(): QuotationRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as QuotationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQuotations(items: QuotationRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getDefaultOffer(): QuotationOffer {
  return {
    supplierName: "",
    price: 0,
    deliveryDays: 0,
    freight: 0,
    validityDays: 0,
    paymentCondition: "",
  };
}

export default function CotacoesPage() {
  const { currentWork } = useWork();
  const { data: suppliers = [], isLoading: isSuppliersLoading } = useSuppliers();

  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationRecord["status"] | "Todas">("Todas");

  const [title, setTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);

  const [offerForm, setOfferForm] = useState<QuotationOffer>(getDefaultOffer());
  const [editingOfferIndex, setEditingOfferIndex] = useState<number | null>(null);

  const [justification, setJustification] = useState("");
  const [newHistoryEntry, setNewHistoryEntry] = useState("");
  const { feedback, showFeedback } = usePageFeedback();
  const { requestConfirmation, dialog } = useConfirmDialog();

  useEffect(() => {
    const items = loadQuotations();
    setQuotations(items);
    if (items.length > 0) {
      setSelectedQuotationId(items[0].id);
    }
  }, []);

  useEffect(() => {
    saveQuotations(quotations);
  }, [quotations]);

  const workQuotations = useMemo(
    () => quotations.filter((q) => q.workId === currentWork?.id),
    [quotations, currentWork?.id]
  );
  const filteredQuotations = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byStatus = statusFilter === "Todas" ? workQuotations : workQuotations.filter((q) => q.status === statusFilter);
    if (!term) return byStatus;

    return byStatus.filter((q) => {
      const titleMatches = q.title.toLowerCase().includes(term);
      const itemMatches = q.itemDescription.toLowerCase().includes(term);
      return titleMatches || itemMatches;
    });
  }, [search, statusFilter, workQuotations]);

  const selectedQuotation = useMemo(
    () => filteredQuotations.find((q) => q.id === selectedQuotationId) || null,
    [filteredQuotations, selectedQuotationId]
  );

  useEffect(() => {
    if (!selectedQuotation) {
      setJustification("");
      return;
    }

    setJustification(selectedQuotation.justification ?? "");
  }, [selectedQuotation]);

  useEffect(() => {
    if (!currentWork) {
      setSelectedQuotationId(null);
      setEditingQuotationId(null);
      clearQuotationForm();
      clearOfferForm();
      setJustification("");
      return;
    }

    if (filteredQuotations.length === 0) {
      setSelectedQuotationId(null);
      return;
    }

    const stillExists = filteredQuotations.some((quotation) => quotation.id === selectedQuotationId);
    if (!stillExists) {
      setSelectedQuotationId(filteredQuotations[0].id);
    }
  }, [currentWork, filteredQuotations, selectedQuotationId]);

  const canConclude = (quotation: QuotationRecord) => quotation.offers.length >= 3 || Boolean(quotation.justification?.trim());
  const formatMoney = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  const summary = useMemo(() => {
    const concluded = workQuotations.filter((q) => q.status === "Concluida").length;
    const inAnalysis = workQuotations.filter((q) => q.status === "Em analise").length;
    const withThreePrices = workQuotations.filter((q) => q.offers.length >= 3).length;
    const pendingRule = workQuotations.filter((q) => q.offers.length < 3 && !q.justification?.trim()).length;
    return { concluded, inAnalysis, withThreePrices, pendingRule };
  }, [workQuotations]);

  const clearQuotationForm = () => {
    setTitle("");
    setItemDescription("");
    setEditingQuotationId(null);
  };

  const clearOfferForm = () => {
    setOfferForm(getDefaultOffer());
    setEditingOfferIndex(null);
  };

  const createQuotation = () => {
    if (!currentWork) {
      showFeedback("Selecione uma obra ativa antes de criar cotacoes.", "warning");
      return;
    }

    if (!title.trim() || !itemDescription.trim()) {
      showFeedback("Preencha titulo e descricao do item da cotacao.", "warning");
      return;
    }

    const next: QuotationRecord = {
      id: crypto.randomUUID(),
      workId: currentWork.id,
      title: title.trim(),
      itemDescription: itemDescription.trim(),
      status: "Rascunho",
      offers: [],
      history: ["Cotacao criada"],
    };

    setQuotations((prev) => [next, ...prev]);
    setSelectedQuotationId(next.id);
    clearQuotationForm();
    showFeedback("Cotacao criada.", "success");

    appendAuditEvent({
      action: "Criacao",
      entity: "Cotacao",
      details: `${next.title} (${currentWork.name})`,
      level: "success",
    });
  };

  const startEditQuotation = (quotation: QuotationRecord) => {
    setEditingQuotationId(quotation.id);
    setTitle(quotation.title);
    setItemDescription(quotation.itemDescription);
  };

  const saveQuotationEdit = () => {
    if (!editingQuotationId) return;
    if (!title.trim() || !itemDescription.trim()) {
      showFeedback("Preencha titulo e descricao para salvar.", "warning");
      return;
    }

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === editingQuotationId
          ? {
              ...q,
              title: title.trim(),
              itemDescription: itemDescription.trim(),
              history: [...q.history, "Cotacao atualizada"],
            }
          : q
      )
    );

    showFeedback("Cotacao atualizada.", "success");
    appendAuditEvent({
      action: "Atualizacao",
      entity: "Cotacao",
      details: title.trim(),
      level: "success",
    });
    clearQuotationForm();
  };

  const deleteQuotation = (quotation: QuotationRecord) => {
    requestConfirmation({
      title: "Excluir cotacao",
      description: `Deseja excluir a cotacao "${quotation.title}"?`,
      confirmLabel: "Excluir cotacao",
      tone: "danger",
      onConfirm: () => {
        setQuotations((prev) => prev.filter((q) => q.id !== quotation.id));

        if (selectedQuotationId === quotation.id) {
          const remaining = workQuotations.filter((q) => q.id !== quotation.id);
          setSelectedQuotationId(remaining[0]?.id ?? null);
        }

        if (editingQuotationId === quotation.id) {
          clearQuotationForm();
        }

        showFeedback("Cotacao removida.", "success");
        appendAuditEvent({
          action: "Exclusao",
          entity: "Cotacao",
          details: quotation.title,
          level: "warning",
        });
      },
    });
  };

  const upsertOffer = () => {
    if (!selectedQuotation) {
      showFeedback("Selecione uma cotacao para incluir propostas.", "warning");
      return;
    }

    if (
      !offerForm.supplierName.trim() ||
      offerForm.price <= 0 ||
      offerForm.deliveryDays <= 0 ||
      offerForm.validityDays <= 0
    ) {
      showFeedback("Preencha os dados obrigatorios da proposta.", "warning");
      return;
    }

    const normalized: QuotationOffer = {
      ...offerForm,
      supplierName: offerForm.supplierName.trim(),
      paymentCondition: offerForm.paymentCondition.trim() || "Nao informado",
    };

    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== selectedQuotation.id) return q;

        if (editingOfferIndex === null) {
          return {
            ...q,
            status: q.status === "Rascunho" ? "Em analise" : q.status,
            offers: [...q.offers, normalized],
            history: [...q.history, `Proposta adicionada: ${normalized.supplierName}`],
          };
        }

        return {
          ...q,
          offers: q.offers.map((offer, index) => (index === editingOfferIndex ? normalized : offer)),
          history: [...q.history, `Proposta atualizada: ${normalized.supplierName}`],
        };
      })
    );

    showFeedback(editingOfferIndex === null ? "Proposta adicionada." : "Proposta atualizada.", "success");
    appendAuditEvent({
      action: editingOfferIndex === null ? "Adicao de proposta" : "Atualizacao de proposta",
      entity: "Cotacao",
      details: normalized.supplierName,
      level: "info",
    });
    clearOfferForm();
  };

  const startEditOffer = (index: number) => {
    if (!selectedQuotation) return;
    const target = selectedQuotation.offers[index];
    if (!target) return;

    setEditingOfferIndex(index);
    setOfferForm(target);
  };

  const removeOffer = (index: number) => {
    if (!selectedQuotation) return;
    const target = selectedQuotation.offers[index];
    if (!target) return;

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === selectedQuotation.id
          ? {
              ...q,
              offers: q.offers.filter((_, offerIndex) => offerIndex !== index),
              history: [...q.history, `Proposta removida: ${target.supplierName}`],
            }
          : q
      )
    );

    if (editingOfferIndex === index) {
      clearOfferForm();
    }

    showFeedback("Proposta removida.", "success");
  };

  const updateJustification = () => {
    if (!selectedQuotation) return;

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === selectedQuotation.id
          ? {
              ...q,
              justification,
              history: [...q.history, "Justificativa de regra dos 3 precos atualizada"],
            }
          : q
      )
    );

    showFeedback("Justificativa salva.", "success");
  };

  const addHistoryEntry = () => {
    if (!selectedQuotation) return;
    const note = newHistoryEntry.trim();
    if (!note) {
      showFeedback("Informe uma mensagem para o historico.", "warning");
      return;
    }

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === selectedQuotation.id
          ? {
              ...q,
              history: [...q.history, `Contato registrado: ${note}`],
            }
          : q
      )
    );
    setNewHistoryEntry("");
    showFeedback("Mensagem adicionada ao historico.", "success");
  };

  const concludeQuotation = () => {
    if (!selectedQuotation) return;

    if (!canConclude(selectedQuotation)) {
      showFeedback("Para concluir, informe 3 propostas ou justificativa formal.", "warning");
      return;
    }

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === selectedQuotation.id
          ? {
              ...q,
              status: "Concluida",
              history: [...q.history, "Cotacao concluida"],
            }
          : q
      )
    );

    showFeedback("Cotacao concluida.", "success");

    appendAuditEvent({
      action: "Conclusao",
      entity: "Cotacao",
      details: selectedQuotation.title,
      level: "success",
    });
  };

  if (!currentWork) {
    return (
      <PageShell
        title="Cotacoes"
        subtitle="Selecione uma obra ativa para gerenciar solicitacoes de cotacao."
        requiredPermission="quotations.manage.view"
      >
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Nenhuma obra ativa</h3>
              <p className="card-subtitle">Escolha uma obra antes de criar cotacoes e comparar propostas.</p>
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
      title="Cotacoes"
      subtitle={`Solicitacoes de cotacao e comparativo da obra ativa: ${currentWork.name}.`}
      requiredPermission="quotations.manage.view"
    >
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="Cotacoes em analise" value={summary.inAnalysis} helper="Demandas com propostas em avaliacao" />
        <StatCard label="Cotacoes concluidas" value={summary.concluded} helper="Fluxos finalizados pela equipe" />
        <StatCard label="Regra 3 precos atendida" value={summary.withThreePrices} helper="Com no minimo 3 propostas" />
        <StatCard label="Pendencia regra 3 precos" value={summary.pendingRule} helper="Sem 3 propostas e sem justificativa" />
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{editingQuotationId ? "Editar cotacao" : "Nova solicitacao de cotacao"}</h3>
              <p className="card-subtitle">Crie ou atualize solicitacoes base para materiais e servicos.</p>
            </div>
            <PersistenceBadge mode="local" />
          </div>

          <PermissionGate permission="quotations.manage.write" fallback={<p>Sem permissao para criar cotacoes.</p>}>
            <div className="form-group">
              <label className="form-label" htmlFor="quotation-title">Titulo</label>
              <input id="quotation-title" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="quotation-item">Item da cotacao</label>
              <input
                id="quotation-item"
                className="form-input"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              {editingQuotationId ? (
                <button className="btn btn-secondary" type="button" onClick={clearQuotationForm}>
                  Cancelar
                </button>
              ) : null}
              <button
                className="btn btn-primary"
                type="button"
                onClick={editingQuotationId ? saveQuotationEdit : createQuotation}
              >
                {editingQuotationId ? "Salvar cotacao" : "Criar cotacao"}
              </button>
            </div>
          </PermissionGate>
          <PersistenceNotice
            mode="local"
            title="Persistencia deste modulo"
            description="As solicitacoes, propostas, justificativas e historico desta fase ficam salvos localmente por obra no navegador."
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Cotacoes cadastradas</h3>
              <p className="card-subtitle">Selecione para incluir propostas e comparar.</p>
            </div>
            <PersistenceBadge mode="local" />
          </div>

          <FilterBar title="Filtros de cotacoes" description="Busque por titulo/item e refine por status">
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <SearchInput
                placeholder="Ex.: cimento, concreto, acabamento..."
                value={search}
                onChange={setSearch}
              />
              <select
                className="form-input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as QuotationRecord["status"] | "Todas")}
              >
                <option value="Todas">Todos os status</option>
                <option value="Rascunho">Rascunho</option>
                <option value="Enviada">Enviada</option>
                <option value="Em analise">Em analise</option>
                <option value="Concluida">Concluida</option>
              </select>
            </div>
          </FilterBar>

          {filteredQuotations.length === 0 ? (
            <EmptyState
              title="Nenhuma cotacao encontrada"
              description={workQuotations.length === 0 ? "Nenhuma cotacao criada." : "Nenhuma cotacao atende ao filtro informado."}
            />
          ) : (
            <div style={{ display: "grid", gap: "0.625rem" }}>
              {filteredQuotations.map((quotation) => (
                <div key={quotation.id} style={{ display: "grid", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className={`btn ${selectedQuotationId === quotation.id ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setSelectedQuotationId(quotation.id)}
                    style={{ justifyContent: "space-between" }}
                  >
                    <span>{quotation.title}</span>
                    <span className="badge">{quotation.status}</span>
                  </button>
                  <PermissionGate permission="quotations.manage.write">
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => startEditQuotation(quotation)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => deleteQuotation(quotation)}>
                        Excluir
                      </button>
                    </div>
                  </PermissionGate>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedQuotation ? (
        <>
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Propostas da cotacao</h3>
                <p className="card-subtitle">{selectedQuotation.title} - {selectedQuotation.itemDescription}</p>
              </div>
              <PersistenceBadge mode="local" />
            </div>
            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span className={selectedQuotation.offers.length >= 3 ? "badge badge-green" : "badge badge-orange"}>
                {selectedQuotation.offers.length >= 3
                  ? "Regra dos 3 precos atendida"
                  : `Regra dos 3 precos pendente (${selectedQuotation.offers.length}/3)`}
              </span>
              <span className={canConclude(selectedQuotation) ? "badge badge-blue" : "badge badge-red"}>
                {canConclude(selectedQuotation) ? "Pode concluir" : "Conclusao bloqueada"}
              </span>
            </div>

            <PermissionGate permission="quotations.manage.write" fallback={<p>Sem permissao para editar cotacoes.</p>}>
              <div className="two-col">
                <div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="offer-supplier">Fornecedor</label>
                    <input
                      id="offer-supplier"
                      className="form-input"
                      list="suppliers-list"
                      value={offerForm.supplierName}
                      onChange={(e) => setOfferForm((prev) => ({ ...prev, supplierName: e.target.value }))}
                      placeholder="Nome do fornecedor"
                    />
                    <datalist id="suppliers-list">
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.name} />
                      ))}
                    </datalist>
                    {!isSuppliersLoading && suppliers.length > 0 ? (
                      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {suppliers.slice(0, 6).map((supplier) => (
                          <button
                            key={supplier.id}
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setOfferForm((prev) => ({ ...prev, supplierName: supplier.name }))}
                          >
                            {supplier.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preco</label>
                    <input
                      type="number"
                      className="form-input"
                      value={offerForm.price}
                      onChange={(e) => setOfferForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prazo (dias)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={offerForm.deliveryDays}
                      onChange={(e) => setOfferForm((prev) => ({ ...prev, deliveryDays: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <div className="form-group">
                    <label className="form-label">Frete</label>
                    <input
                      type="number"
                      className="form-input"
                      value={offerForm.freight}
                      onChange={(e) => setOfferForm((prev) => ({ ...prev, freight: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Validade (dias)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={offerForm.validityDays}
                      onChange={(e) => setOfferForm((prev) => ({ ...prev, validityDays: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condicao de pagamento</label>
                    <input
                      className="form-input"
                      value={offerForm.paymentCondition}
                      onChange={(e) => setOfferForm((prev) => ({ ...prev, paymentCondition: e.target.value }))}
                      placeholder="Ex.: 30/60"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                {editingOfferIndex !== null ? (
                  <button className="btn btn-secondary" type="button" onClick={clearOfferForm}>
                    Cancelar
                  </button>
                ) : null}
                <button className="btn btn-secondary" type="button" onClick={upsertOffer}>
                  {editingOfferIndex === null ? "Adicionar proposta" : "Salvar proposta"}
                </button>
              </div>

              {selectedQuotation.offers.length === 0 ? (
                <p style={{ marginTop: "1rem" }}>Nenhuma proposta cadastrada.</p>
              ) : (
                <div className="table-container" style={{ marginTop: "1rem" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Fornecedor</th>
                        <th>Preco</th>
                        <th>Prazo</th>
                        <th>Frete</th>
                        <th>Acoes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotation.offers.map((offer, index) => (
                        <tr key={`${offer.supplierName}-${index}`}>
                          <td>{offer.supplierName}</td>
                          <td>{formatMoney(offer.price)}</td>
                          <td>{offer.deliveryDays} dia(s)</td>
                          <td>{formatMoney(offer.freight)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <button type="button" className="btn btn-secondary" onClick={() => startEditOffer(index)}>
                                Editar
                              </button>
                              <button type="button" className="btn btn-ghost" onClick={() => removeOffer(index)}>
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: "1.25rem" }}>
                <QuotationComparisonTable offers={selectedQuotation.offers} />
              </div>

              <div style={{ marginTop: "1rem" }}>
                {selectedQuotation.offers.length < 3 ? (
                  <div className="card" style={{ borderColor: "var(--warning)", marginBottom: "1rem" }}>
                    <p>Regra dos 3 precos: faltam propostas. Informe justificativa formal para concluir.</p>
                  </div>
                ) : (
                  <span className="badge badge-green">Regra dos 3 precos atendida</span>
                )}
              </div>

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label className="form-label" htmlFor="quotation-justification">Justificativa (quando menos de 3 propostas)</label>
                <textarea
                  id="quotation-justification"
                  className="form-input"
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={updateJustification}>
                  Salvar justificativa
                </button>
                <button className="btn btn-primary" type="button" onClick={concludeQuotation}>
                  Concluir cotacao
                </button>
              </div>
            </PermissionGate>
          </div>

          <div className="card" style={{ marginTop: "1.5rem" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Historico de comunicacao</h3>
                <p className="card-subtitle">Linha do tempo de eventos da cotacao.</p>
              </div>
            </div>

            {selectedQuotation.history.length === 0 ? (
              <p>Nenhum evento registrado.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.5rem" }}>
                {selectedQuotation.history.map((entry, index) => (
                  <li key={`${entry}-${index}`}>
                    <span className="badge badge-blue" style={{ marginRight: "0.5rem" }}>Evento</span>
                    {entry}
                  </li>
                ))}
              </ul>
            )}
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label" htmlFor="quotation-history-note">Registrar comunicacao</label>
              <textarea
                id="quotation-history-note"
                className="form-input"
                rows={2}
                value={newHistoryEntry}
                onChange={(event) => setNewHistoryEntry(event.target.value)}
                placeholder="Ex.: fornecedor confirmou prazo por telefone."
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-secondary" onClick={addHistoryEntry}>
                Adicionar ao historico
              </button>
            </div>
          </div>
        </>
      ) : null}

      <FeedbackNotice feedback={feedback} />
      {dialog}
    </PageShell>
  );
}
