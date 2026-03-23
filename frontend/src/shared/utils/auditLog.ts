export type AuditLevel = "info" | "warning" | "success" | "error";

export type AuditEvent = {
  id: string;
  at: string;
  action: string;
  entity: string;
  details?: string;
  level: AuditLevel;
};

const STORAGE_KEY = "crm-obras:audit-log";
const MAX_ITEMS = 200;

export function readAuditLog(): AuditEvent[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as AuditEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendAuditEvent(event: Omit<AuditEvent, "id" | "at">) {
  if (typeof window === "undefined") return;

  const current = readAuditLog();
  const next: AuditEvent[] = [
    {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      ...event,
    },
    ...current,
  ].slice(0, MAX_ITEMS);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearAuditLog() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}