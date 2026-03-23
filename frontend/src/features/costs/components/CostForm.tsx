"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { COST_TYPE_OPTIONS } from "@/features/costs/types/cost.types";

const costFormSchema = z.object({
  costType: z.coerce.number().int().min(1, "Selecione o tipo"),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  description: z.string().min(3, "Descricao obrigatoria"),
});

export type CostFormValues = z.infer<typeof costFormSchema>;

type CostFormProps = {
  initialValues?: CostFormValues | null;
  onSubmit: (values: CostFormValues) => Promise<boolean | void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
  resetOnSuccess?: boolean;
};

export function CostForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Lancar custo",
  resetOnSuccess = true,
}: CostFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CostFormValues>({
    resolver: zodResolver(costFormSchema),
    defaultValues: {
      costType: 3,
      amount: 0,
      description: "",
    },
  });

  useEffect(() => {
    if (!initialValues) {
      reset({
        costType: 3,
        amount: 0,
        description: "",
      });
      return;
    }

    reset(initialValues);
  }, [initialValues, reset]);

  const submit = async (values: CostFormValues) => {
    const result = await onSubmit(values);
    if (result !== false && resetOnSuccess) {
      reset({ costType: values.costType, amount: 0, description: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="form-group">
        <label className="form-label" htmlFor="cost-type">Tipo de custo</label>
        <select id="cost-type" className="form-input" {...register("costType")}>
          {COST_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.costType ? <p className="field-error">{errors.costType.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cost-amount">Valor</label>
        <input id="cost-amount" type="number" step="0.01" min="0" className="form-input" placeholder="0,00" {...register("amount")} />
        {errors.amount ? <p className="field-error">{errors.amount.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cost-description">Descricao</label>
        <input id="cost-description" className="form-input" placeholder="Ex.: Compra de cimento" {...register("description")} />
        {errors.description ? <p className="field-error">{errors.description.message}</p> : null}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        {onCancel ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
