export const COST_TYPE_OPTIONS = [
  { value: 1, label: "Mao de obra" },
  { value: 2, label: "Utilidades" },
  { value: 3, label: "Materiais" },
  { value: 4, label: "Diversos" },
] as const;

export type CostTypeValue = (typeof COST_TYPE_OPTIONS)[number]["value"];

export type CreateCostInput = {
  workId: string;
  costType: CostTypeValue;
  amount: number;
  description: string;
};

export type CostSummaryDto = {
  workId: string;
  total: number;
  byType: Record<string, number>;
};