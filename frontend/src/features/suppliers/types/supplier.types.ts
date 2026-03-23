export type SupplierDto = {
  id: string;
  name: string;
  contact?: string | null;
};

export type CreateSupplierInput = {
  name: string;
  contact?: string;
};

export type UpdateSupplierInput = {
  id: string;
  name: string;
  contact?: string;
};