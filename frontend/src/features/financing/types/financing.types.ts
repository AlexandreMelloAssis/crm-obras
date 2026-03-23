export type FinancingRecord = {
  id: string;
  workId: string;
  title: string;
  institution: string;
  contractNumber: string;
  amount: number;
  contractSigningDate: string;
  createdAt: string;
  updatedAt?: string;
};

export type FinancingStageRecord = {
  id: string;
  financingId: string;
  workId: string;
  stageName: string;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
};
