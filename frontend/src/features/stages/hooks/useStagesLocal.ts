import { useMemo } from "react";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { stagesApi } from "@/features/stages/services/stages.api";
import type { StageRecord, StageStatus } from "@/features/stages/types/stage.types";

const STORAGE_KEY = "crm-obras:stages-local";

export function useStagesLocal(workId?: string) {
  const [records, setRecords] = useLocalStorage<StageRecord[]>(STORAGE_KEY, []);

  const stages = useMemo(
    () => records.filter((record) => record.workId === workId),
    [records, workId]
  );

  const createStage = async (payload: { name: string; description?: string }) => {
    if (!workId) {
      throw new Error("Selecione uma obra ativa para criar etapas.");
    }

    const id = await stagesApi.create({
      workId,
      name: payload.name,
      description: payload.description,
    });

    const next: StageRecord = {
      id,
      workId,
      name: payload.name,
      description: payload.description,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setRecords((prev) => [next, ...prev]);
    return next;
  };

  const updateStage = (id: string, payload: { name: string; description?: string; status: StageStatus }) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id
          ? {
              ...record,
              name: payload.name,
              description: payload.description,
              status: payload.status,
            }
          : record
      )
    );
  };

  const removeStage = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return {
    stages,
    createStage,
    updateStage,
    removeStage,
  };
}
