"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAnalyzeDocument, useDocumentCategories, useUploadDocument } from "@/features/documents/hooks/useDocuments";
import type { DocumentAnalysisResult } from "@/features/documents/types/document.types";
import { buildFinancingAnalysisFromLocalOcr, runLocalWindowsImageOcr } from "@/features/financing/utils/financingOcr";
import { parseApiError } from "@/shared/utils/apiError";
import type { FinancingRecord, FinancingStageRecord } from "@/features/financing/types/financing.types";

const stageSchema = z.object({
  stageName: z.string().min(2, "Informe a etapa da obra"),
});

const financingSchema = z.object({
  title: z.string().min(3, "Informe um titulo"),
  institution: z.string().min(2, "Informe a instituicao"),
  contractNumber: z.string().min(3, "Informe o numero do contrato"),
  amount: z.string().min(1, "Informe o valor financiado"),
  contractSigningDate: z.string().min(1, "Informe a data de assinatura"),
  stages: z.array(stageSchema).min(1, "Cadastre ao menos uma etapa da obra"),
});

type FinancingFormInputs = z.infer<typeof financingSchema>;

export type FinancingFormValues = {
  title: string;
  institution: string;
  contractNumber: string;
  amount: number;
  contractSigningDate: string;
  stages: string[];
};

type FinancingFormProps = {
  workId: string;
  initialValues?: FinancingRecord | null;
  initialStages?: FinancingStageRecord[];
  onSubmit: (values: FinancingFormValues) => Promise<boolean | void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  resetOnSuccess?: boolean;
};

type SupportFileKind = "contract" | "schedule";

type ExtractionState = {
  status: "idle" | "processing" | "success" | "error";
  message?: string;
};

type SupportFileAnalysisState = {
  fileName: string;
  result: DocumentAnalysisResult;
};

const EMPTY_VALUES: FinancingFormInputs = {
  title: "",
  institution: "",
  contractNumber: "",
  amount: "",
  contractSigningDate: "",
  stages: [{ stageName: "" }],
};

const DEFAULT_FINANCING_CATEGORY_IDS = {
  contract: "11111111-1111-1111-1111-111111111122",
  schedule: "11111111-1111-1111-1111-111111111123",
} as const;

function parseCurrency(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function toCurrencyInputValue(value?: string | null) {
  if (!value) return "";
  const normalized = value.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return value;

  return parsed.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  return "";
}

function formatInitialValues(
  record?: FinancingRecord | null,
  stages?: FinancingStageRecord[]
): FinancingFormInputs {
  if (!record) return EMPTY_VALUES;

  return {
    title: record.title,
    institution: record.institution,
    contractNumber: record.contractNumber,
    amount: String(record.amount),
    contractSigningDate: record.contractSigningDate,
    stages: stages?.length ? stages.map((stage) => ({ stageName: stage.stageName })) : [{ stageName: "" }],
  };
}

function findDocumentCategoryId(kind: SupportFileKind, categories: Array<{ id: string; name: string }>) {
  const normalized = categories.map((category) => ({
    ...category,
    nameLower: category.name.toLowerCase(),
  }));

  if (kind === "contract") {
    return (
      normalized.find((category) => category.nameLower.includes("contrato"))?.id
      ?? DEFAULT_FINANCING_CATEGORY_IDS.contract
    );
  }

  return (
    normalized.find((category) => category.nameLower.includes("cronograma"))?.id ??
    normalized.find((category) => category.nameLower.includes("memorial"))?.id ??
    normalized.find((category) => category.nameLower.includes("contrato"))?.id ??
    DEFAULT_FINANCING_CATEGORY_IDS.schedule
  );
}

function extractField(result: DocumentAnalysisResult, ...keys: string[]) {
  for (const key of keys) {
    const match = result.fields.find((field) => field.key === key && field.value?.trim());
    if (match) return match.value.trim();
  }

  return "";
}

function extractStages(result: DocumentAnalysisResult) {
  const itemStages = result.items
    .map((item) => item.name.trim())
    .filter(Boolean);

  if (itemStages.length > 0) {
    return Array.from(new Set(itemStages));
  }

  const fieldValue = extractField(result, "workStages", "extractedItems");
  if (!fieldValue) return [];

  return Array.from(
    new Set(
      fieldValue
        .split(/\r?\n|;/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 2)
    )
  );
}

function getMissingContractLabels(result: DocumentAnalysisResult) {
  const missing: string[] = [];

  if (!extractField(result, "contractNumber", "documentNumber")) {
    missing.push("Numero do contrato");
  }

  if (!extractField(result, "financedAmount", "totalAmount")) {
    missing.push("Valor financiado");
  }

  if (!extractField(result, "contractSigningDate", "issueDate")) {
    missing.push("Data de assinatura");
  }

  return missing;
}

function getMissingScheduleLabels(result: DocumentAnalysisResult) {
  return extractStages(result).length > 0 ? [] : ["Etapas da obra"];
}

function isUnreliableScheduleAnalysis(result: DocumentAnalysisResult) {
  const noRealText =
    !result.rawTextPreview
    || result.rawTextPreview.includes("OCR HTTP ainda nao configurado neste ambiente")
    || result.rawTextPreview.includes("Tesseract OCR nao foi encontrado")
    || result.rawTextPreview.includes("Tesseract OCR esta desativado")
    || result.rawTextPreview.includes("OCR nativo do Windows falhou")
    || result.rawTextPreview.includes("Windows OCR executado, mas nenhum texto foi identificado");

  return [
    "ocr_not_configured",
    "ocr_http_unavailable",
    "manual_review",
    "tesseract_not_installed",
    "tesseract_failed",
    "tesseract_empty",
    "windows_ocr_failed",
    "windows_ocr_empty",
  ].includes(result.extractionMode) && noRealText;
}

function sanitizeScheduleAnalysis(result: DocumentAnalysisResult): DocumentAnalysisResult {
  if (!isUnreliableScheduleAnalysis(result)) {
    return result;
  }

  return {
    ...result,
    fields: [],
    items: [],
    summary: `Leitura de cronograma/financiamento para '${result.fileName}'. Nenhuma etapa foi identificada automaticamente.`,
    recommendations: [
      "O cronograma foi anexado, mas este ambiente ainda nao conseguiu ler o PDF automaticamente.",
      "Cadastre as etapas manualmente antes de salvar o contrato.",
    ],
  };
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|bmp|tiff?|webp)$/i.test(file.name);
}

function shouldTryLocalContractFallback(result: DocumentAnalysisResult, file: File) {
  if (!isImageFile(file)) return false;

  const hasUsefulFields = Boolean(extractField(result, "contractNumber", "documentNumber"))
    || Boolean(extractField(result, "financedAmount", "totalAmount"))
    || Boolean(extractField(result, "contractSigningDate", "issueDate"));

  if (hasUsefulFields) return false;

  return [
    "ocr_not_configured",
    "ocr_http_unavailable",
    "manual_review",
    "tesseract_not_installed",
    "tesseract_failed",
    "tesseract_empty",
    "windows_ocr_failed",
    "windows_ocr_empty",
  ].includes(result.extractionMode);
}

export function FinancingForm({
  workId,
  initialValues,
  initialStages = [],
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  resetOnSuccess = true,
}: FinancingFormProps) {
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);
  const [stageDraft, setStageDraft] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [contractExtraction, setContractExtraction] = useState<ExtractionState>({ status: "idle" });
  const [scheduleExtraction, setScheduleExtraction] = useState<ExtractionState>({ status: "idle" });
  const [contractAnalysis, setContractAnalysis] = useState<SupportFileAnalysisState | null>(null);
  const [scheduleAnalysis, setScheduleAnalysis] = useState<SupportFileAnalysisState | null>(null);

  const documentCategories = useDocumentCategories();
  const uploadDocument = useUploadDocument();
  const analyzeDocument = useAnalyzeDocument();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FinancingFormInputs>({
    resolver: zodResolver(financingSchema),
    defaultValues: formatInitialValues(initialValues, initialStages),
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "stages",
  });

  useEffect(() => {
    reset(formatInitialValues(initialValues, initialStages));
    setContractFile(null);
    setScheduleFile(null);
    setStageDraft(initialStages.length ? initialStages.map((stage) => stage.stageName).join("\n") : "");
    setUploadError(null);
    setContractExtraction({ status: "idle" });
    setScheduleExtraction({ status: "idle" });
    setContractAnalysis(null);
    setScheduleAnalysis(null);
  }, [initialValues, initialStages, reset]);

  const isProcessingSupportFile = useMemo(
    () =>
      contractExtraction.status === "processing"
      || scheduleExtraction.status === "processing"
      || uploadDocument.isPending
      || analyzeDocument.isPending,
    [analyzeDocument.isPending, contractExtraction.status, scheduleExtraction.status, uploadDocument.isPending]
  );

  const applyContractAnalysis = (result: DocumentAnalysisResult) => {
    const contractNumber = extractField(result, "contractNumber", "documentNumber");
    const financedAmount = extractField(result, "financedAmount", "totalAmount");
    const contractSigningDate = extractField(result, "contractSigningDate", "issueDate");

    if (contractNumber) {
      setValue("contractNumber", contractNumber, { shouldValidate: true, shouldDirty: true });
    }

    if (financedAmount) {
      setValue("amount", toCurrencyInputValue(financedAmount), { shouldValidate: true, shouldDirty: true });
    }

    if (contractSigningDate) {
      const normalizedDate = toDateInputValue(contractSigningDate);
      if (normalizedDate) {
        setValue("contractSigningDate", normalizedDate, { shouldValidate: true, shouldDirty: true });
      }
    }
  };

  const applyScheduleAnalysis = (result: DocumentAnalysisResult) => {
    const stages = extractStages(result);
    if (stages.length > 0) {
      replace(stages.map((stageName) => ({ stageName })));
      setStageDraft(stages.join("\n"));
    }
  };

  const importStagesFromDraft = () => {
    const parsed = Array.from(
      new Set(
        stageDraft
          .split(/\r?\n|;/)
          .map((item) => item.replace(/^\d+[\.\)-]?\s*/, "").trim())
          .filter((item) => item.length >= 2)
      )
    );

    if (parsed.length > 0) {
      replace(parsed.map((stageName) => ({ stageName })));
    }
  };

  const processSupportFile = async (kind: SupportFileKind, file: File) => {
    setUploadError(null);

    const setState = kind === "contract" ? setContractExtraction : setScheduleExtraction;
    setState({ status: "processing", message: "Enviando arquivo e lendo informacoes..." });

    try {
      const categories = documentCategories.data ?? [];
      const categoryId = findDocumentCategoryId(kind, categories);

      if (!categoryId) {
        throw new Error(
          kind === "contract"
            ? "Nao foi possivel localizar a categoria de contrato para o upload."
            : "Nao foi possivel localizar a categoria de cronograma para o upload."
        );
      }

      const documentId = await uploadDocument.mutateAsync({
        workId,
        categoryId,
        file,
      });

      let result = await analyzeDocument.mutateAsync(documentId);

      if (kind === "contract" && shouldTryLocalContractFallback(result, file)) {
        try {
          const localOcr = await runLocalWindowsImageOcr(file);
          const localResult = buildFinancingAnalysisFromLocalOcr(documentId, file.name, localOcr);

          if (localResult.fields.length > result.fields.length) {
            result = localResult;
          }
        } catch {
          // Keep backend result when local OCR fallback is unavailable.
        }
      }

      if (kind === "schedule") {
        result = sanitizeScheduleAnalysis(result);
      }

      if (kind === "contract") {
        setContractAnalysis({ fileName: file.name, result });
      } else {
        setScheduleAnalysis({ fileName: file.name, result });
      }

      if (kind === "contract") {
        applyContractAnalysis(result);
      } else {
        applyScheduleAnalysis(result);
      }

      const populatedMessage =
        kind === "contract"
          ? "Numero do contrato, valor financiado e data de assinatura atualizados a partir do arquivo."
          : "Etapas da obra atualizadas a partir do cronograma carregado.";

      const ocrUnavailable =
        result.extractionMode === "tesseract_disabled"
        || result.extractionMode === "tesseract_not_installed"
        || result.extractionMode === "tesseract_failed"
        || result.extractionMode === "tesseract_empty"
        || result.extractionMode === "tesseract_skipped"
        || result.extractionMode === "ocr_not_configured"
        || result.extractionMode === "ocr_http_unavailable"
        || result.extractionMode === "manual_review";

      const emptyMessage =
        kind === "contract"
          ? ocrUnavailable
            ? "Arquivo enviado, mas este ambiente ainda nao esta conseguindo ler imagem/PDF automaticamente. Complete os campos manualmente se necessario."
            : "Arquivo enviado, mas a leitura nao encontrou todos os campos do contrato. Complete manualmente se necessario."
          : ocrUnavailable
            ? "Arquivo enviado, mas este ambiente ainda nao esta conseguindo ler o cronograma automaticamente. Ajuste as etapas manualmente se necessario."
            : "Arquivo enviado, mas a leitura nao encontrou etapas suficientes. Ajuste manualmente se necessario.";

      const didPopulate =
        kind === "contract"
          ? Boolean(extractField(result, "contractNumber", "documentNumber", "financedAmount", "totalAmount", "contractSigningDate", "issueDate"))
          : extractStages(result).length > 0;

      setState({
        status: "success",
        message: didPopulate ? populatedMessage : emptyMessage,
      });
    } catch (error) {
      const message = parseApiError(error, "Nao foi possivel processar o arquivo de apoio do financiamento.");
      setState({ status: "error", message });
      setUploadError(message);
    }
  };

  const handleContractFileChange = async (file: File | null) => {
    setContractFile(file);
    setContractExtraction({ status: "idle" });
    setContractAnalysis(null);

    if (!file) return;
    await processSupportFile("contract", file);
  };

  const handleScheduleFileChange = async (file: File | null) => {
    setScheduleFile(file);
    setScheduleExtraction({ status: "idle" });
    setScheduleAnalysis(null);

    if (!file) return;
    await processSupportFile("schedule", file);
  };

  const submit = async (values: FinancingFormInputs) => {
    setUploadError(null);

    const result = await onSubmit({
      title: values.title.trim(),
      institution: values.institution.trim(),
      contractNumber: values.contractNumber.trim(),
      amount: parseCurrency(values.amount),
      contractSigningDate: values.contractSigningDate,
      stages: values.stages.map((stage) => stage.stageName.trim()).filter(Boolean),
    });

    if (result !== false && resetOnSuccess) {
      reset(EMPTY_VALUES);
      setContractFile(null);
      setScheduleFile(null);
      setStageDraft("");
      setContractExtraction({ status: "idle" });
      setScheduleExtraction({ status: "idle" });
      setContractAnalysis(null);
      setScheduleAnalysis(null);
    }
  };

  const disableSubmit = isSubmitting || isProcessingSupportFile;
  const currentStages = getValues("stages");

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="financing-form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="financing-title">Titulo</label>
          <input id="financing-title" className="form-input" {...register("title")} />
          {errors.title ? <p className="field-error">{errors.title.message}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="financing-institution">Instituicao</label>
          <input id="financing-institution" className="form-input" {...register("institution")} />
          {errors.institution ? <p className="field-error">{errors.institution.message}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="financing-contractNumber">Numero do contrato</label>
          <input id="financing-contractNumber" className="form-input" {...register("contractNumber")} />
          {errors.contractNumber ? <p className="field-error">{errors.contractNumber.message}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="financing-amount">Valor financiado</label>
          <input id="financing-amount" className="form-input" placeholder="442.388,65" {...register("amount")} />
          {errors.amount ? <p className="field-error">{errors.amount.message}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="financing-contractSigningDate">Data de assinatura do contrato</label>
          <input id="financing-contractSigningDate" type="date" className="form-input" {...register("contractSigningDate")} />
          {errors.contractSigningDate ? <p className="field-error">{errors.contractSigningDate.message}</p> : null}
        </div>
      </div>

      <div className="financing-upload-grid" style={{ marginTop: "1.5rem" }}>
        <div className="financing-upload-card">
          <h4 className="card-title">Resumo do contrato</h4>
          <p className="card-subtitle">Ao carregar o resumo, tentamos preencher numero, valor financiado e data de assinatura.</p>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="financing-contract-file">Arquivo do resumo</label>
            <input
              id="financing-contract-file"
              type="file"
              className="form-input"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(event) => void handleContractFileChange(event.target.files?.[0] ?? null)}
            />
          </div>
          {contractFile ? <p className="financing-file-chip">Arquivo selecionado: {contractFile.name}</p> : null}
          {contractExtraction.message ? (
            <p className={contractExtraction.status === "error" ? "field-error" : "card-subtitle"} style={{ marginTop: "0.75rem" }}>
              {contractExtraction.message}
            </p>
          ) : null}
          {contractAnalysis ? (
            <SupportFileAnalysisCard
              title="Diagnostico da leitura do resumo"
              analysis={contractAnalysis}
              missingLabels={getMissingContractLabels(contractAnalysis.result)}
            />
          ) : null}
        </div>

        <div className="financing-upload-card">
          <h4 className="card-title">Cronograma da obra</h4>
          <p className="card-subtitle">Ao carregar o cronograma, tentamos montar automaticamente as etapas vinculadas ao contrato.</p>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="financing-schedule-file">Arquivo do cronograma</label>
            <input
              id="financing-schedule-file"
              type="file"
              className="form-input"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(event) => void handleScheduleFileChange(event.target.files?.[0] ?? null)}
            />
          </div>
          {scheduleFile ? <p className="financing-file-chip">Arquivo selecionado: {scheduleFile.name}</p> : null}
          {scheduleExtraction.message ? (
            <p className={scheduleExtraction.status === "error" ? "field-error" : "card-subtitle"} style={{ marginTop: "0.75rem" }}>
              {scheduleExtraction.message}
            </p>
          ) : null}
          {scheduleAnalysis ? (
            <SupportFileAnalysisCard
              title="Diagnostico da leitura do cronograma"
              analysis={scheduleAnalysis}
              missingLabels={getMissingScheduleLabels(scheduleAnalysis.result)}
            />
          ) : null}
          <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
            <div>
              <strong style={{ display: "block", marginBottom: "0.35rem" }}>Importacao manual de etapas</strong>
              <p className="card-subtitle" style={{ margin: 0 }}>
                Cole uma etapa por linha ou separadas por `;`. Isso ajuda quando o PDF vier sem texto legivel.
              </p>
            </div>
            <textarea
              className="form-textarea"
              rows={5}
              value={stageDraft}
              onChange={(event) => setStageDraft(event.target.value)}
              placeholder={"Ex.:\nFundacao\nEstrutura\nAlvenaria\nInstalacoes\nAcabamentos"}
            />
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-secondary" onClick={importStagesFromDraft}>
                Aplicar etapas coladas
              </button>
              <span className="card-subtitle">
                O cronograma anexado permanece vinculado ao contrato, mesmo quando a leitura automatica nao encontrar texto.
              </span>
            </div>
          </div>
        </div>
      </div>

      {documentCategories.error ? (
        <p className="field-error">
          {parseApiError(documentCategories.error, "Nao foi possivel carregar as categorias de documentos para os uploads de apoio.")}
        </p>
      ) : null}

      {uploadError ? <p className="field-error">{uploadError}</p> : null}

      <div className="financing-release-header">
        <div>
          <h4 className="card-title">Etapas da obra</h4>
          <p className="card-subtitle">
            As etapas devem vir do cronograma carregado. Se faltar alguma, voce ainda pode ajustar antes de salvar.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => append({ stageName: "" })}
        >
          Adicionar etapa
        </button>
      </div>

      <div className="financing-release-list">
        {fields.map((field, index) => (
          <div key={field.id} className="financing-release-card">
            <div className="financing-release-card-header">
              <div>
                <strong>Etapa {index + 1}</strong>
              </div>
              {fields.length > 1 ? (
                <button type="button" className="btn btn-ghost" onClick={() => remove(index)}>
                  Remover
                </button>
              ) : null}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor={`financing-stage-${index}`}>Nome da etapa</label>
              <input id={`financing-stage-${index}`} className="form-input" {...register(`stages.${index}.stageName`)} />
              {errors.stages?.[index]?.stageName ? (
                <p className="field-error">{errors.stages[index]?.stageName?.message}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {errors.stages?.message ? <p className="field-error">{errors.stages.message}</p> : null}
      {!errors.stages?.message && currentStages.length > 0 ? (
        <p className="card-subtitle" style={{ marginTop: "0.75rem" }}>
          {currentStages.filter((stage) => stage.stageName.trim()).length} etapa(s) pronta(s) para vincular a este contrato.
        </p>
      ) : null}

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
        {onCancel ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={disableSubmit}>
          {disableSubmit ? "Processando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

type SupportFileAnalysisCardProps = {
  title: string;
  analysis: SupportFileAnalysisState;
  missingLabels: string[];
};

function SupportFileAnalysisCard({ title, analysis, missingLabels }: SupportFileAnalysisCardProps) {
  const { result, fileName } = analysis;

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        borderRadius: "14px",
        border: "1px solid var(--line)",
        background: "var(--bg-secondary)",
        display: "grid",
        gap: "0.9rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div>
          <h5 style={{ margin: 0, fontSize: "0.98rem" }}>{title}</h5>
          <p className="card-subtitle" style={{ margin: "0.35rem 0 0" }}>
            Arquivo analisado: {fileName}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <span className="badge">{result.extractionMode}</span>
          <span className="badge">{result.parserName}</span>
          <span className="badge">{result.confidence}</span>
        </div>
      </div>

      <p className="card-subtitle" style={{ margin: 0 }}>
        {result.summary}
      </p>

      {result.fields.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Campo reconhecido</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {result.fields.map((field) => (
                <tr key={`${field.key}-${field.value}`}>
                  <td>{field.label}</td>
                  <td>{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="card-subtitle" style={{ margin: 0 }}>
          Nenhum campo estruturado foi reconhecido neste arquivo.
        </p>
      )}

      {missingLabels.length > 0 ? (
        <div>
          <strong style={{ display: "block", marginBottom: "0.45rem" }}>Campos ainda faltando</strong>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {missingLabels.map((label) => (
              <span key={label} className="badge badge-orange">
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <span className="badge badge-green">Arquivo suficiente para preencher os campos esperados</span>
        </div>
      )}

      {result.items.length > 0 ? (
        <div>
          <strong style={{ display: "block", marginBottom: "0.45rem" }}>Itens identificados</strong>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {result.items.map((item, index) => (
              <span key={`${item.name}-${index}`} className="badge">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {result.rawTextPreview ? (
        <div>
          <strong style={{ display: "block", marginBottom: "0.45rem" }}>Trecho lido</strong>
          <div
            style={{
              whiteSpace: "pre-wrap",
              border: "1px solid var(--line)",
              borderRadius: "12px",
              padding: "0.85rem",
              background: "var(--bg-primary)",
              color: "var(--text-secondary)",
              fontSize: "0.92rem",
            }}
          >
            {result.rawTextPreview}
          </div>
        </div>
      ) : null}
    </div>
  );
}
