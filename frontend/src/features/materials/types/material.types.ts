export type MaterialDto = {
  id: string;
  name: string;
  unit: string;
  category: string;
};

export type CreateMaterialInput = {
  name: string;
  unit: string;
  category: number;
};
