export type StageStatus = "Pending" | "InProgress" | "Completed";

export type StageRecord = {
  id: string;
  workId: string;
  name: string;
  description?: string;
  status: StageStatus;
  createdAt: string;
};

export type CreateStageInput = {
  workId: string;
  name: string;
  description?: string;
};
