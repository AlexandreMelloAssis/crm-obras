"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  DocumentAnalysisDraft,
  DocumentAnalysisItem,
  DocumentAnalysisResult,
  DocumentCategoryOption,
  DocumentMaterialSuggestion,
  UploadedDocumentLocal,
} from "@/features/documents/types/document.types";
import { buildAnalysisDraft, getWorkflowMeta } from "@/features/documents/utils/documentAnalysis";
import { useAnalyzeDocument } from "@/features/documents/hooks/useDocuments";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { PersistenceBadge, PersistenceNotice } from "@/shared/components/common/PersistenceBadge";
import { usePageFeedback } from "@/shared/hooks/usePageFeedback";
import { FeedbackNotice } from "@/shared/components/common/FeedbackNotice";
import { parseApiError } from "@/shared/utils/apiError";

type Props = {
  workId: string;
  uploads: UploadedDocumentLocal[];
  categories: DocumentCategoryOption[];
};

export function DocumentAnalysisPanel({ workId, uploads, categories }: Props) {
  const { feedback, showFeedback, clearFeedback } = usePageFeedback();
  const analyzeDocument = useAnalyzeDocument();
  const [drafts, setDrafts] = useLocalStorage<DocumentAnalysisDraft[]>("crm-obras:document-analysis", []);
  const [, setMaterialSuggestions] = useLocalStorage<DocumentMaterialSuggestion[]>("crm-obras:materials-imports", []);
  const [, setCostRecords] = useLocalStorage<LocalCostRecord[]>("crm-obras:costs-local", []);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(uploads[0]?.id ?? "");
  const [quotations, setQuotations] = useState<LocalQuotationRecord[]>([]);
  const [draft, setDraft] = useState<DocumentAnalysisDraft | null>(null);

  const workDrafts = useMemo(
    () => drafts.filter((item) => item.workId === workId),
    [drafts, workId]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("crm-obras:quotations-local");
      const parsed = raw ? (JSON.parse(raw) as LocalQuotationRecord[]) : [];
      setQuotations(Array.isArray(parsed) ? parsed : []);
    } catch {
      setQuotations([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("crm-obras:quotations-local", JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    if (!selectedDocumentId && uploads[0]?.id) {
      setSelectedDocumentId(uploads[0].id);
    }
  }, [selectedDocumentId, uploads]);

  useEffect(() => {
    if (!selectedDocumentId) {
      setDraft(null);
      return;
    }

    const existingDraft = drafts.find((item) => item.documentId === selectedDocumentId);
    if (existingDraft) {
      setDraft(existingDraft);
      return;
    }

    const selectedUpload = uploads.find((item) => item.id === selectedDocumentId);
    if (!selectedUpload) {
      setDraft(null);
      return;
    }

    const category = categories.find((item) => item.id === selectedUpload.categoryId);
    setDraft(buildAnalysisDraft(selectedUpload, category));
  }, [categories, drafts, selectedDocumentId, uploads]);

  if (uploads.length === 0) {
    return null;
  }

  const selectedUpload = uploads.find((item) => item.id === selectedDocumentId);
  const workflowMeta = draft ? getWorkflowMeta(draft.workflow) : null;

  const updateDraft = (field: keyof DocumentAnalysisDraft, value: string) => {
    if (!draft) return;
    clearFeedback();
    setDraft({
      ...draft,
      [field]: value,
      lastUpdatedAt: new Date().toISOString(),
    });
  };

  const saveDraft = () => {
    if (!draft) return;

    setDrafts((prev) => {
      const filtered = prev.filter((item) => item.documentId !== draft.documentId);
      return [draft, ...filtered];
    });

    showFeedback("Leitura assistida salva neste navegador.", "success");
  };

  const removeDraft = () => {
    if (!draft) return;

    setDrafts((prev) => prev.filter((item) => item.documentId !== draft.documentId));
    setDraft(buildAnalysisDraft(selectedUpload!, categories.find((item) => item.id === selectedUpload?.categoryId)));
    showFeedback("Leitura assistida removida.", "success");
  };

  const runAnalysis = async () => {
    if (!draft) return;

    clearFeedback();

    try {
      const result = await analyzeDocument.mutateAsync(draft.documentId);
      const nextDraft = mergeAnalysisResult(draft, result);
      setDraft(nextDraft);
      setDrafts((prev) => {
        const filtered = prev.filter((item) => item.documentId !== nextDraft.documentId);
        return [nextDraft, ...filtered];
      });
      showFeedback("Sugestoes carregadas a partir da analise do documento.", "success");
    } catch (error) {
      showFeedback(parseApiError(error, "Nao foi possivel analisar o documento."), "error");
    }
  };

  const generateMaterialSuggestions = () => {
    if (!draft) return;

    const suggestions = toMaterialSuggestions(draft);
    if (suggestions.length === 0) {
      showFeedback("Nenhum item de material foi encontrado para transformar em sugestao.", "warning");
      return;
    }

    setMaterialSuggestions((prev) => [...suggestions, ...prev.filter((item) => item.sourceDocumentId !== draft.documentId)]);
    showFeedback(`${suggestions.length} sugestao(oes) de material enviada(s) para o modulo de Materiais.`, "success");
  };

  const generateCostDraft = () => {
    if (!draft) return;

    const amount = Number(draft.totalAmount ?? draft.estimatedMaterialCost ?? 0);
    if (!amount || amount <= 0) {
      showFeedback("Informe ou gere um valor total antes de criar o rascunho de custo.", "warning");
      return;
    }

    const description = draft.summary || `${draft.categoryLabel} - ${draft.fileName}`;

    setCostRecords((prev) => [
      {
        id: crypto.randomUUID(),
        workId: draft.workId,
        costType: 3,
        amount,
        description,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    showFeedback("Rascunho de custo enviado para o modulo de Custos.", "success");
  };

  const generateQuotationDraft = () => {
    if (!draft) return;

    const title = draft.quoteReference?.trim() || draft.categoryLabel || "Cotacao importada";
    const itemDescription =
      draft.structuredItems?.map((item) => `${item.name}${item.quantity ? ` - ${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : ""}`).join("; ")
      || draft.extractedItems?.trim()
      || draft.summary
      || draft.fileName;

    const offer =
      draft.supplierName.trim() || Number(draft.freightValue ?? 0) > 0 || Number(draft.leadTimeDays ?? 0) > 0
        ? [
            {
              supplierName: draft.supplierName.trim() || "Fornecedor importado",
              price: Number(draft.totalAmount ?? 0),
              deliveryDays: Number(draft.leadTimeDays ?? 0),
              freight: Number(draft.freightValue ?? 0),
              validityDays: Number(draft.validityDays ?? 0),
              paymentCondition: draft.paymentTerms?.trim() || "Nao informado",
            },
          ]
        : [];

    const nextQuotation: LocalQuotationRecord = {
      id: crypto.randomUUID(),
      workId: draft.workId,
      title,
      itemDescription,
      status: offer.length > 0 ? "Em analise" : "Rascunho",
      offers: offer,
      history: [`Cotacao importada do documento ${draft.fileName}`],
      justification: "",
    };

    setQuotations((prev) => [nextQuotation, ...prev]);
    showFeedback("Rascunho de cotacao enviado para o modulo de Cotacoes.", "success");
  };

  return (
    <div className="card" style={{ marginTop: "1.5rem" }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">Leitura assistida de documentos</h3>
          <p className="card-subtitle">Base operacional para OCR, extracao e revisao humana.</p>
        </div>
        <PersistenceBadge mode="local" />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="analysis-document">Documento</label>
        <select
          id="analysis-document"
          className="form-input"
          value={selectedDocumentId}
          onChange={(event) => setSelectedDocumentId(event.target.value)}
        >
          {uploads.map((item) => (
            <option key={item.id} value={item.id}>
              {item.fileName} - {item.categoryLabel ?? item.categoryId}
            </option>
          ))}
        </select>
      </div>

      {draft && workflowMeta ? (
        <>
          <div className="dashboard-grid" style={{ marginTop: "1rem" }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <div>
                  <h4 className="card-title">{workflowMeta.title}</h4>
                  <p className="card-subtitle">{workflowMeta.description}</p>
                </div>
                <PersistenceBadge mode="local" />
              </div>
              <p style={{ marginTop: 0 }}>{workflowMeta.actionHint}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
                <li>Categoria: <strong>{draft.categoryLabel}</strong></li>
                <li>Workflow: <strong>{draft.workflow}</strong></li>
                <li>Disciplina sugerida: <strong>{draft.detectedDiscipline || "Nao identificada"}</strong></li>
                <li>Modo de extracao: <strong>{draft.extractionMode || "manual"}</strong></li>
                <li>Parser: <strong>{draft.parserName || "local-draft"}</strong></li>
                <li>Confianca: <strong>{draft.confidence || "manual"}</strong></li>
              </ul>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <div className="card-header">
                <div>
                  <h4 className="card-title">Leitura operacional</h4>
                  <p className="card-subtitle">Preencha os dados que vamos levar para materiais, cotacoes e custos.</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="analysis-summary">Resumo</label>
                <textarea
                  id="analysis-summary"
                  className="form-input"
                  rows={3}
                  value={draft.summary}
                  onChange={(event) => updateDraft("summary", event.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="analysis-items">Itens extraidos</label>
                <textarea
                  id="analysis-items"
                  className="form-input"
                  rows={5}
                  placeholder="Ex.: Piso 60x60 - 120 m2&#10;Cimento CP-II - 40 sacos"
                  value={draft.extractedItems}
                  onChange={(event) => updateDraft("extractedItems", event.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="analysis-notes">Observacoes da leitura</label>
                <textarea
                  id="analysis-notes"
                  className="form-input"
                  rows={3}
                  value={draft.sourceNotes}
                  onChange={(event) => updateDraft("sourceNotes", event.target.value)}
                />
              </div>

              {draft.rawTextPreview ? (
                <div className="form-group">
                  <label className="form-label">Trecho lido do arquivo</label>
                  <div className="card-subtitle" style={{ whiteSpace: "pre-wrap", border: "1px solid var(--line)", borderRadius: "12px", padding: "0.85rem" }}>
                    {draft.rawTextPreview}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {draft.workflow === "materials" ? (
            <div className="dashboard-grid" style={{ marginTop: "1rem" }}>
              <MetricInput label="Disciplina" value={draft.detectedDiscipline ?? ""} onChange={(value) => updateDraft("detectedDiscipline", value)} />
              <MetricInput label="Area total (m2)" value={draft.areaM2 ?? ""} onChange={(value) => updateDraft("areaM2", value)} />
              <MetricInput label="Area de paredes (m2)" value={draft.wallAreaM2 ?? ""} onChange={(value) => updateDraft("wallAreaM2", value)} />
              <MetricInput label="Area de piso (m2)" value={draft.floorAreaM2 ?? ""} onChange={(value) => updateDraft("floorAreaM2", value)} />
              <MetricInput label="Area de teto (m2)" value={draft.ceilingAreaM2 ?? ""} onChange={(value) => updateDraft("ceilingAreaM2", value)} />
              <MetricInput label="Area de pintura (m2)" value={draft.paintAreaM2 ?? ""} onChange={(value) => updateDraft("paintAreaM2", value)} />
              <MetricInput label="Estimativa de materiais (R$)" value={draft.estimatedMaterialCost ?? ""} onChange={(value) => updateDraft("estimatedMaterialCost", value)} />
            </div>
          ) : null}

          {draft.workflow === "quotation" ? (
            <div className="dashboard-grid" style={{ marginTop: "1rem" }}>
              <MetricInput label="Fornecedor" value={draft.supplierName} onChange={(value) => updateDraft("supplierName", value)} />
              <MetricInput label="Referencia da proposta" value={draft.quoteReference ?? ""} onChange={(value) => updateDraft("quoteReference", value)} />
              <MetricInput label="Frete (R$)" value={draft.freightValue ?? ""} onChange={(value) => updateDraft("freightValue", value)} />
              <MetricInput label="Condicao de pagamento" value={draft.paymentTerms ?? ""} onChange={(value) => updateDraft("paymentTerms", value)} />
              <MetricInput label="Prazo (dias)" value={draft.leadTimeDays ?? ""} onChange={(value) => updateDraft("leadTimeDays", value)} />
              <MetricInput label="Validade (dias)" value={draft.validityDays ?? ""} onChange={(value) => updateDraft("validityDays", value)} />
            </div>
          ) : null}

          {draft.workflow === "cost" ? (
            <div className="dashboard-grid" style={{ marginTop: "1rem" }}>
              <MetricInput label="Fornecedor" value={draft.supplierName} onChange={(value) => updateDraft("supplierName", value)} />
              <MetricInput label="Numero do documento" value={draft.documentNumber ?? ""} onChange={(value) => updateDraft("documentNumber", value)} />
              <MetricInput label="Data de emissao" value={draft.issueDate ?? ""} onChange={(value) => updateDraft("issueDate", value)} />
              <MetricInput label="Data de vencimento" value={draft.dueDate ?? ""} onChange={(value) => updateDraft("dueDate", value)} />
              <MetricInput label="Valor total (R$)" value={draft.totalAmount ?? ""} onChange={(value) => updateDraft("totalAmount", value)} />
              <MetricInput label="Centro de custo" value={draft.costCenter ?? ""} onChange={(value) => updateDraft("costCenter", value)} />
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <div className="badge">Ultima atualizacao: {new Date(draft.lastUpdatedAt).toLocaleString("pt-BR")}</div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {draft.workflow === "materials" ? (
                <button type="button" className="btn btn-secondary" onClick={generateMaterialSuggestions}>
                  Enviar para materiais
                </button>
              ) : null}
              {draft.workflow === "quotation" ? (
                <button type="button" className="btn btn-secondary" onClick={generateQuotationDraft}>
                  Enviar para cotacoes
                </button>
              ) : null}
              {draft.workflow === "cost" ? (
                <button type="button" className="btn btn-secondary" onClick={generateCostDraft}>
                  Enviar para custos
                </button>
              ) : null}
              <button type="button" className="btn btn-secondary" onClick={runAnalysis} disabled={analyzeDocument.isPending}>
                {analyzeDocument.isPending ? "Analisando..." : "Gerar sugestoes"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={removeDraft}>
                Limpar leitura
              </button>
              <button type="button" className="btn btn-primary" onClick={saveDraft}>
                Salvar leitura
              </button>
            </div>
          </div>

          <FeedbackNotice feedback={feedback} />
          <PersistenceNotice
            mode="local"
            title="OCR-ready"
            description="Nesta etapa, a leitura assistida organiza os campos e a revisao humana. A proxima integracao pode preencher essa ficha automaticamente com OCR/PDF parser e IA de extracao."
          />

          {draft.structuredItems?.length ? (
            <div style={{ marginTop: "1rem" }}>
              <h4 className="card-title">Itens estruturados</h4>
              <div className="table-container" style={{ marginTop: "0.75rem" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantidade</th>
                      <th>Unidade</th>
                      <th>Origem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.structuredItems.map((item, index) => (
                      <tr key={`${item.name}-${index}`}>
                        <td>{item.name}</td>
                        <td>{item.quantity ?? "-"}</td>
                        <td>{item.unit ?? "-"}</td>
                        <td>{item.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {draft.recommendations?.length ? (
            <div style={{ marginTop: "1rem" }}>
              <h4 className="card-title">Recomendacoes da analise</h4>
              <ul style={{ margin: "0.75rem 0 0", paddingLeft: "1rem", display: "grid", gap: "0.5rem" }}>
                {draft.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {workDrafts.length > 0 ? (
            <div style={{ marginTop: "1rem" }}>
              <h4 className="card-title">Leituras salvas nesta obra</h4>
              <div className="table-container" style={{ marginTop: "0.75rem" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Arquivo</th>
                      <th>Categoria</th>
                      <th>Workflow</th>
                      <th>Atualizado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workDrafts.map((item) => (
                      <tr key={item.documentId}>
                        <td>{item.fileName}</td>
                        <td>{item.categoryLabel}</td>
                        <td>{item.workflow}</td>
                        <td>{new Date(item.lastUpdatedAt).toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function mergeAnalysisResult(draft: DocumentAnalysisDraft, result: DocumentAnalysisResult): DocumentAnalysisDraft {
  const nextDraft: DocumentAnalysisDraft = {
    ...draft,
    workflow: result.workflow,
    summary: result.summary || draft.summary,
    extractionMode: result.extractionMode,
    parserName: result.parserName,
    confidence: result.confidence,
    rawTextPreview: result.rawTextPreview,
    recommendations: result.recommendations,
    structuredItems: result.items,
    detectedDiscipline: result.discipline ?? draft.detectedDiscipline,
    lastUpdatedAt: new Date().toISOString(),
  };

  for (const field of result.fields) {
    switch (field.key) {
      case "discipline":
        nextDraft.detectedDiscipline = field.value;
        break;
      case "supplierName":
        nextDraft.supplierName = field.value;
        break;
      case "extractedItems":
        nextDraft.extractedItems = field.value;
        break;
      case "areaM2":
        nextDraft.areaM2 = field.value;
        break;
      case "wallAreaM2":
        nextDraft.wallAreaM2 = field.value;
        break;
      case "floorAreaM2":
        nextDraft.floorAreaM2 = field.value;
        break;
      case "ceilingAreaM2":
        nextDraft.ceilingAreaM2 = field.value;
        break;
      case "paintAreaM2":
        nextDraft.paintAreaM2 = field.value;
        break;
      case "estimatedMaterialCost":
        nextDraft.estimatedMaterialCost = field.value;
        break;
      case "freightValue":
        nextDraft.freightValue = field.value;
        break;
      case "paymentTerms":
        nextDraft.paymentTerms = field.value;
        break;
      case "leadTimeDays":
        nextDraft.leadTimeDays = field.value;
        break;
      case "validityDays":
        nextDraft.validityDays = field.value;
        break;
      case "quoteReference":
        nextDraft.quoteReference = field.value;
        break;
      case "documentNumber":
        nextDraft.documentNumber = field.value;
        break;
      case "issueDate":
        nextDraft.issueDate = field.value;
        break;
      case "dueDate":
        nextDraft.dueDate = field.value;
        break;
      case "totalAmount":
        nextDraft.totalAmount = field.value;
        break;
      case "costCenter":
        nextDraft.costCenter = field.value;
        break;
      default:
        break;
    }
  }

  return nextDraft;
}

type LocalCostRecord = {
  id: string;
  workId: string;
  costType: number;
  amount: number;
  description: string;
  createdAt: string;
};

type LocalQuotationOffer = {
  supplierName: string;
  price: number;
  deliveryDays: number;
  freight: number;
  validityDays: number;
  paymentCondition: string;
};

type LocalQuotationRecord = {
  id: string;
  workId: string;
  title: string;
  itemDescription: string;
  status: "Rascunho" | "Enviada" | "Em analise" | "Concluida";
  offers: LocalQuotationOffer[];
  justification?: string;
  history: string[];
};

function toMaterialSuggestions(draft: DocumentAnalysisDraft): DocumentMaterialSuggestion[] {
  if (draft.structuredItems?.length) {
    return draft.structuredItems.map((item) => ({
      id: crypto.randomUUID(),
      workId: draft.workId,
      sourceDocumentId: draft.documentId,
      sourceFileName: draft.fileName,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || inferUnit(item.notes || item.name),
      category: inferMaterialCategory(draft.detectedDiscipline, draft.categoryLabel, item.name),
      notes: item.notes || draft.summary,
      createdAt: new Date().toISOString(),
    }));
  }

  const items = draft.extractedItems
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.map((item) => ({
    id: crypto.randomUUID(),
    workId: draft.workId,
    sourceDocumentId: draft.documentId,
    sourceFileName: draft.fileName,
    name: normalizeMaterialName(item),
    quantity: inferQuantity(item),
    unit: inferUnit(item),
    category: inferMaterialCategory(draft.detectedDiscipline, draft.categoryLabel, item),
    notes: draft.summary,
    createdAt: new Date().toISOString(),
  }));
}

function inferUnit(text: string) {
  const normalized = text.toLowerCase();
  if (normalized.includes("m2") || normalized.includes("m²")) return "m2";
  if (normalized.includes("m3") || normalized.includes("m³")) return "m3";
  if (normalized.includes("kg")) return "kg";
  if (normalized.includes("l ")) return "l";
  return "un";
}

function inferQuantity(text: string) {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s?(m2|mÂ²|m3|mÂ³|kg|un|l|ml|cx|pc|pt|barra|rolo)?/i);
  if (!match) return null;

  const normalized = Number(match[1].replace(",", "."));
  return Number.isFinite(normalized) ? normalized : null;
}

function normalizeMaterialName(text: string) {
  return text
    .replace(/\s*-\s*\d+[.,]?\d*\s?(m2|m²|m3|m³|kg|un|l)?/i, "")
    .trim();
}

function inferMaterialCategory(discipline?: string, categoryLabel?: string, item?: string) {
  const combined = `${discipline ?? ""} ${categoryLabel ?? ""} ${item ?? ""}`.toLowerCase();

  if (combined.includes("eletric")) return 3;
  if (combined.includes("hidraul")) return 4;
  if (combined.includes("pintura") || combined.includes("gesso") || combined.includes("marmore") || combined.includes("acab")) return 2;
  if (combined.includes("ferrament")) return 5;
  return 1;
}

type MetricInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function MetricInput({ label, value, onChange }: MetricInputProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
