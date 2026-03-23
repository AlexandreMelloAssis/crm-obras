import { useMemo } from "react";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import type { FinancingStageRecord } from "@/features/financing/types/financing.types";

const STORAGE_KEY = "crm-obras:financing-stages-local";

export function useFinancingStagesLocal(workId?: string) {
  const [records, setRecords] = useLocalStorage<FinancingStageRecord[]>(STORAGE_KEY, []);

  const workStages = useMemo(
    () => records.filter((record) => record.workId === workId),
    [records, workId]
  );

  const getStagesByFinancing = (financingId: string) =>
    workStages
      .filter((record) => record.financingId === financingId)
      .sort((left, right) => left.sortOrder - right.sortOrder);

  const replaceStages = (financingId: string, stageNames: string[]) => {
    if (!workId) {
      throw new Error("Selecione uma obra ativa.");
    }

    const nextStages = stageNames.map((stageName, index) => ({
      id: crypto.randomUUID(),
      financingId,
      workId,
      stageName,
      sortOrder: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setRecords((prev) => [
      ...prev.filter((record) => record.financingId !== financingId),
      ...nextStages,
    ]);

    return nextStages;
  };

  const removeStagesByFinancing = (financingId: string) => {
    setRecords((prev) => prev.filter((record) => record.financingId !== financingId));
  };

  return {
    workStages,
    getStagesByFinancing,
    replaceStages,
    removeStagesByFinancing,
  };
}
