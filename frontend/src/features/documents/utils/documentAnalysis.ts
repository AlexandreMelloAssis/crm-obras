import type {
  DocumentAnalysisDraft,
  DocumentCategoryOption,
  DocumentWorkflow,
  UploadedDocumentLocal,
} from "@/features/documents/types/document.types";

type WorkflowMeta = {
  title: string;
  description: string;
  actionHint: string;
};

const DISCIPLINE_KEYWORDS: Array<{ label: string; keywords: string[] }> = [
  { label: "Arquitetonico", keywords: ["arquitet", "planta", "layout", "fachada"] },
  { label: "Eletrico", keywords: ["eletric", "tomada", "quadro", "ilumin"] },
  { label: "Hidraulico", keywords: ["hidraul", "esgoto", "agua", "tubula"] },
  { label: "Gesso", keywords: ["gesso", "forro", "sanca"] },
  { label: "Marmore", keywords: ["marmor", "granito", "pedra"] },
  { label: "Pintura", keywords: ["pintura", "tinta", "massa corrida"] },
];

export function getWorkflowMeta(workflow: DocumentWorkflow): WorkflowMeta {
  switch (workflow) {
    case "materials":
      return {
        title: "Leitura tecnica para materiais",
        description: "Use esta ficha para transformar plantas e memoriais em metragem, disciplina e estimativa de materiais.",
        actionHint: "Depois da leitura, leve os itens para Materiais, Custos ou planejamento de compras.",
      };
    case "quotation":
      return {
        title: "Leitura comercial para cotacao",
        description: "Estruture proposta, frete, prazo, validade e condicao de pagamento para comparativo com fornecedores.",
        actionHint: "Depois da leitura, consolide a proposta no modulo de Cotacoes.",
      };
    case "cost":
      return {
        title: "Leitura financeira para custos",
        description: "Capture dados de nota fiscal, comprovante e documento de custo para lancamento operacional.",
        actionHint: "Depois da leitura, registre o valor no modulo de Custos da obra.",
      };
    default:
      return {
        title: "Leitura de documento de referencia",
        description: "Registre o contexto do arquivo, observacoes e itens relevantes para a equipe.",
        actionHint: "Use como base de consulta, auditoria ou apoio a compras e execucao.",
      };
  }
}

export function detectDiscipline(text: string) {
  const normalized = text.trim().toLowerCase();

  for (const item of DISCIPLINE_KEYWORDS) {
    if (item.keywords.some((keyword) => normalized.includes(keyword))) {
      return item.label;
    }
  }

  return "";
}

export function buildAnalysisDraft(
  document: UploadedDocumentLocal,
  category?: DocumentCategoryOption
): DocumentAnalysisDraft {
  const detectedDiscipline = detectDiscipline(`${document.categoryLabel ?? ""} ${document.fileName}`);

  return {
    documentId: document.id,
    workId: document.workId,
    fileName: document.fileName,
    categoryId: document.categoryId,
    categoryLabel: document.categoryLabel ?? category?.name ?? "Documento",
    workflow: category?.workflow ?? document.workflow ?? "reference",
    detectedDiscipline,
    summary: suggestSummary(document.fileName, document.categoryLabel ?? category?.name ?? ""),
    supplierName: "",
    sourceNotes: "",
    extractedItems: "",
    quoteReference: "",
    paymentTerms: "",
    leadTimeDays: "",
    validityDays: "",
    freightValue: "",
    areaM2: "",
    wallAreaM2: "",
    floorAreaM2: "",
    ceilingAreaM2: "",
    paintAreaM2: "",
    estimatedMaterialCost: "",
    documentNumber: "",
    issueDate: "",
    dueDate: "",
    totalAmount: "",
    costCenter: "",
    lastUpdatedAt: new Date().toISOString(),
  };
}

function suggestSummary(fileName: string, categoryLabel: string) {
  const discipline = detectDiscipline(`${fileName} ${categoryLabel}`);
  const base = categoryLabel || "Documento";

  if (discipline) {
    return `${base} com foco em ${discipline.toLowerCase()}. Revisar itens e metragem antes de seguir para compras/custos.`;
  }

  return `${base} carregado para conferencia operacional. Revise os dados extraidos e confirme o encaminhamento.`;
}
