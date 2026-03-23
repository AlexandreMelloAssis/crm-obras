import { isAxiosError } from "axios";

type ApiErrorPayload = {
  message?: string;
  title?: string;
  error?: string;
  details?: Record<string, string[]>;
  errors?: Record<string, string[] | string>;
};

function normalizeComparable(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getFriendlyMessage(message: string, fallback: string, statusCode?: number): string {
  const normalized = normalizeComparable(message);

  const schemaMismatch =
    ((normalized.includes("coluna") || normalized.includes("column")) &&
      (normalized.includes("nao existe") || normalized.includes("does not exist"))) ||
    ((normalized.includes("relacao") || normalized.includes("relation")) &&
      (normalized.includes("nao existe") || normalized.includes("does not exist"))) ||
    normalized.includes("sqlstate: 42p01") ||
    normalized.includes("sqlstate: 42703");

  if (schemaMismatch) {
    return "O backend local esta em execucao, mas o banco esta desatualizado para este modulo. Atualize o schema/migrations e tente novamente.";
  }

  if (
    normalized.includes("network error") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("err_network") ||
    normalized.includes("err_connection_refused")
  ) {
    return "Nao foi possivel conectar ao backend. Verifique se a API local esta em execucao.";
  }

  if (normalized.includes("an error occurred while saving the entity changes")) {
    return "Nao foi possivel salvar os dados no banco. O backend pode estar com schema desatualizado neste modulo.";
  }

  if (normalized.includes("obra precisa de nome e endereco")) {
    return "Informe nome e endereco da obra antes de salvar.";
  }

  if (normalized.includes("usuario ou senha invalidos")) {
    return "Usuario ou senha invalidos.";
  }

  if (normalized.includes("e-mail ja cadastrado") || normalized.includes("email ja cadastrado")) {
    return "Ja existe um usuario cadastrado com este e-mail.";
  }

  if (normalized === "request failed with status code 400" || normalized === "bad request") {
    return statusCode === 400
      ? `${fallback}. Revise os dados informados e tente novamente.`
      : fallback;
  }

  return message;
}

function flattenValidationErrors(payload: ApiErrorPayload): string | null {
  const details = payload.details ?? payload.errors;
  if (!details) return null;

  const messages = Object.values(details).flatMap((entry) =>
    Array.isArray(entry) ? entry : [entry]
  );

  const normalized = messages
    .map((message) => message.trim())
    .filter(Boolean);

  if (normalized.length === 0) return null;
  return normalized.join(" | ");
}

export function parseApiError(error: unknown, fallback = "Erro inesperado"): string {
  if (isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data;
    const validation = payload ? flattenValidationErrors(payload) : null;
    const rawMessage =
      validation ||
      payload?.message ||
      payload?.error ||
      payload?.title ||
      error.message ||
      fallback;

    return getFriendlyMessage(rawMessage, fallback, error.response?.status);
  }

  if (error instanceof Error) {
    return getFriendlyMessage(error.message || fallback, fallback);
  }

  return fallback;
}
