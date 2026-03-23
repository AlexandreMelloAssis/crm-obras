"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const materialSchema = z.object({
  name: z.string().min(2, "Informe o nome do material"),
  unit: z.string().min(1, "Informe a unidade"),
  category: z.number().int().min(1).max(5),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;

type MaterialFormProps = {
  initialValues?: {
    id?: string;
    name: string;
    unit: string;
    category: number;
  } | null;
  onSubmit: (values: MaterialFormValues) => Promise<boolean | void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  resetOnSuccess?: boolean;
};

export function MaterialForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  resetOnSuccess = true,
}: MaterialFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: "",
      unit: "",
      category: 1,
    },
  });

  useEffect(() => {
    if (!initialValues) {
      reset({
        name: "",
        unit: "",
        category: 1,
      });
      return;
    }

    reset({
      name: initialValues.name,
      unit: initialValues.unit,
      category: initialValues.category,
    });
  }, [initialValues, reset]);

  const handleCreate = async (values: MaterialFormValues) => {
    const result = await onSubmit(values);
    if (result !== false && resetOnSuccess) {
      reset({
        name: "",
        unit: "",
        category: values.category,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleCreate)}>
      <div className="form-group">
        <label className="form-label" htmlFor="material-name">Nome do material</label>
        <input id="material-name" className="form-input" {...register("name")} />
        {errors.name ? <p className="field-error">{errors.name.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="material-unit">Unidade</label>
        <input id="material-unit" className="form-input" placeholder="Ex.: un, kg, m2" {...register("unit")} />
        {errors.unit ? <p className="field-error">{errors.unit.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="material-category">Categoria</label>
        <select
          id="material-category"
          className="form-input"
          {...register("category", {
            valueAsNumber: true,
          })}
        >
          <option value={1}>Estrutural</option>
          <option value={2}>Acabamento</option>
          <option value={3}>Eletrica</option>
          <option value={4}>Hidraulica</option>
          <option value={5}>Ferramentas</option>
        </select>
        {errors.category ? <p className="field-error">{errors.category.message}</p> : null}
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
