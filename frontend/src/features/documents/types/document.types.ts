export type UploadDocumentInput = {
  workId: string;
  categoryId: string;
  file: File;
};

export type DocumentWorkflow = "materials" | "quotation" | "cost" | "reference";

export type DocumentCategoryOption = {
  id: string;
  name: string;
  type: string;
  workflow: DocumentWorkflow;
};

export type DocumentAnalysisField = {
  key: string;
  label: string;
  value: string;
};

export type DocumentAnalysisItem = {
  name: string;
  quantity?: number | null;
  unit?: string | null;
  source: string;
  notes?: string | null;
};

export type DocumentAnalysisResult = {
  documentId: string;
  fileName: string;
  categoryName: string;
  workflow: DocumentWorkflow;
  extractionMode: string;
  parserName: string;
  confidence: string;
  summary: string;
  discipline?: string | null;
  rawTextPreview: string;
  fields: DocumentAnalysisField[];
  items: DocumentAnalysisItem[];
  recommendations: string[];
};

export type UploadedDocumentLocal = {
  id: string;
  workId: string;
  categoryId: string;
  categoryLabel?: string;
  workflow?: DocumentWorkflow;
  fileName: string;
  uploadedAt: string;
};

export type SavedDocumentCategory = {
  label: string;
  categoryId: string;
  lastUsedAt: string;
};

export const SUGGESTED_DOCUMENT_CATEGORY_LABELS = [
  "Nota fiscal",
  "Orcamento",
  "Print de negociacao",
  "Planta / Projeto",
  "Comprovante",
  "Contrato",
  "Outro",
] as const;

export type DocumentAnalysisDraft = {
  documentId: string;
  workId: string;
  fileName: string;
  categoryId: string;
  categoryLabel: string;
  workflow: DocumentWorkflow;
  extractionMode?: string;
  parserName?: string;
  confidence?: string;
  rawTextPreview?: string;
  recommendations?: string[];
  structuredItems?: DocumentAnalysisItem[];
  detectedDiscipline?: string;
  summary: string;
  supplierName: string;
  sourceNotes: string;
  extractedItems: string;
  areaM2?: string;
  wallAreaM2?: string;
  floorAreaM2?: string;
  ceilingAreaM2?: string;
  paintAreaM2?: string;
  estimatedMaterialCost?: string;
  freightValue?: string;
  paymentTerms?: string;
  leadTimeDays?: string;
  validityDays?: string;
  quoteReference?: string;
  documentNumber?: string;
  issueDate?: string;
  dueDate?: string;
  totalAmount?: string;
  costCenter?: string;
  lastUpdatedAt: string;
};

export type DocumentMaterialSuggestion = {
  id: string;
  workId: string;
  sourceDocumentId: string;
  sourceFileName: string;
  name: string;
  quantity?: number | null;
  unit: string;
  category: number;
  notes?: string;
  createdAt: string;
};
