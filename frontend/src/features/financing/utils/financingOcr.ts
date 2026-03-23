import type { DocumentAnalysisField, DocumentAnalysisResult } from "@/features/documents/types/document.types";

type LocalOcrPayload = {
  mode: string;
  text: string;
  preview: string;
  error?: string;
};

function fixMojibake(value: string) {
  return value
    .replace(/[–—−]/g, "-")
    .replace(/Ã¡/g, "á")
    .replace(/Ã /g, "à")
    .replace(/Ã¢/g, "â")
    .replace(/Ã£/g, "ã")
    .replace(/Ã©/g, "é")
    .replace(/Ãª/g, "ê")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ã´/g, "ô")
    .replace(/Ãµ/g, "õ")
    .replace(/Ãº/g, "ú")
    .replace(/Ã§/g, "ç")
    .replace(/�/g, "");
}

function normalizeText(value: string) {
  return fixMojibake(value)
    .replace(/\s+/g, " ")
    .trim();
}

function buildField(key: string, label: string, value?: string | null): DocumentAnalysisField | null {
  if (!value?.trim()) return null;
  return {
    key,
    label,
    value: value.trim(),
  };
}

function parseContractNumber(text: string) {
  const match = text.match(/Contrato\s+([0-9][0-9.-]+)/i);
  return match?.[1]?.trim() ?? "";
}

function parseFinancedAmount(text: string) {
  const direct = text.match(/Valor\s+Financiado[\s\S]{0,40}?R\$\s*([\d.]+,\d{2})/i);
  if (direct?.[1]) return direct[1].trim();

  const amounts = Array.from(text.matchAll(/R\$\s*([\d.]+,\d{2})/gi)).map((match) => match[1]);
  return amounts.at(-1)?.trim() ?? "";
}

function parseSigningDate(text: string) {
  const explicit =
    text.match(/Assinatura(?:\s+do\s+contrato)?[\s:]*([0-3]?\d\/[01]?\d\/\d{4})/i)
    ?? text.match(/Data\s+de\s+assinatura[\s:]*([0-3]?\d\/[01]?\d\/\d{4})/i);

  if (explicit?.[1]) return explicit[1].trim();

  const firstDate = text.match(/([0-3]?\d\/[01]?\d\/\d{4})/);
  return firstDate?.[1]?.trim() ?? "";
}

export async function runLocalWindowsImageOcr(file: File): Promise<LocalOcrPayload> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/ocr/windows-image", {
    method: "POST",
    body,
  });

  const payload = (await response.json()) as LocalOcrPayload;
  if (!response.ok) {
    throw new Error(payload.error || "Nao foi possivel executar o OCR local da imagem.");
  }

  return payload;
}

export function buildFinancingAnalysisFromLocalOcr(
  documentId: string,
  fileName: string,
  payload: LocalOcrPayload
): DocumentAnalysisResult {
  const normalizedText = normalizeText(payload.text);
  const contractNumber = parseContractNumber(normalizedText);
  const financedAmount = parseFinancedAmount(normalizedText);
  const contractSigningDate = parseSigningDate(normalizedText);

  const fields = [
    buildField("contractNumber", "Numero do contrato", contractNumber),
    buildField("financedAmount", "Valor financiado", financedAmount),
    buildField("contractSigningDate", "Data de assinatura", contractSigningDate),
  ].filter(Boolean) as DocumentAnalysisField[];

  const recognizedCount = fields.length;
  const confidence = recognizedCount >= 3 ? "alta" : recognizedCount >= 2 ? "media" : "baixa";

  return {
    documentId,
    fileName,
    categoryName: "Contrato",
    workflow: "reference",
    extractionMode: payload.mode,
    parserName: "financing-local-ocr",
    confidence,
    summary:
      recognizedCount > 0
        ? `OCR local identificou ${recognizedCount} campo(s) util(eis) no resumo do contrato.`
        : "OCR local executado, mas nao encontrou campos suficientes no resumo do contrato.",
    discipline: null,
    rawTextPreview: normalizeText(payload.preview || normalizedText),
    fields,
    items: [],
    recommendations:
      recognizedCount > 0
        ? ["Revise os campos preenchidos automaticamente antes de salvar o contrato."]
        : ["Revise manualmente os campos obrigatorios que ainda nao foram reconhecidos."],
  };
}
