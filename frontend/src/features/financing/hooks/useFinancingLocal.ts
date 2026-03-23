import { useMemo } from "react";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import type { FinancingRecord } from "@/features/financing/types/financing.types";

const STORAGE_KEY = "crm-obras:financing-local";

export function useFinancingLocal(workId?: string) {
  const [records, setRecords] = useLocalStorage<FinancingRecord[]>(STORAGE_KEY, []);

  const financing = useMemo(
    () => records.filter((record) => record.workId === workId),
    [records, workId]
  );

  const createFinancing = (payload: {
    title: string;
    institution: string;
    contractNumber: string;
    amount: number;
    contractSigningDate: string;
  }) => {
    if (!workId) {
      throw new Error("Selecione uma obra ativa.");
    }

    const next: FinancingRecord = {
      id: crypto.randomUUID(),
      workId,
      title: payload.title,
      institution: payload.institution,
      contractNumber: payload.contractNumber,
      amount: payload.amount,
      contractSigningDate: payload.contractSigningDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecords((prev) => [next, ...prev]);
    return next;
  };

  const updateFinancing = (
    id: string,
    payload: {
      title: string;
      institution: string;
      contractNumber: string;
      amount: number;
      contractSigningDate: string;
    }
  ) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id
          ? {
              ...record,
              ...payload,
              updatedAt: new Date().toISOString(),
            }
          : record
      )
    );
  };

  const removeFinancing = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return {
    financing,
    createFinancing,
    updateFinancing,
    removeFinancing,
  };
}
