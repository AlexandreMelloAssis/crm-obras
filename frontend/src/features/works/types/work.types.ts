export type WorkDto = {
  id: string;
  name: string;
  address: string;
  status: string;
};

export type WorkSummaryDto = {
  workId: string;
  total: number;
  realized: number;
  planned: number;
  progress: number; // 0-100
};
