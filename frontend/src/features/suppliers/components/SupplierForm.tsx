"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SupplierDto } from "@/features/suppliers/types/supplier.types";

const supplierSchema = z.object({
  name: z.string().min(3, "Informe pelo menos 3 caracteres"),
  contact: z.string().max(120, "Contato muito longo").optional().or(z.literal("")),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

type SupplierFormProps = {
  initialValues?: SupplierDto | null;
  onSubmit: (values: SupplierFormValues) => Promise<boolean | void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  resetOnSuccess?: boolean;
};

export function SupplierForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  resetOnSuccess = true,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact: "",
    },
  });

  useEffect(() => {
    if (!initialValues) {
      reset({ name: "", contact: "" });
      return;
    }

    reset({
      name: initialValues.name,
      contact: initialValues.contact ?? "",
    });
  }, [initialValues, reset]);

  const submit = async (values: SupplierFormValues) => {
    const result = await onSubmit(values);
    if (result !== false && resetOnSuccess) {
      reset({ name: "", contact: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="form-group">
        <label className="form-label" htmlFor="supplier-name">Nome do fornecedor</label>
        <input id="supplier-name" className="form-input" placeholder="Ex.: Construmax Materiais" {...register("name")} />
        {errors.name ? <p className="field-error">{errors.name.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="supplier-contact">Contato</label>
        <input id="supplier-contact" className="form-input" placeholder="Telefone, e-mail ou responsavel" {...register("contact")} />
        {errors.contact ? <p className="field-error">{errors.contact.message}</p> : null}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        {onCancel ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
