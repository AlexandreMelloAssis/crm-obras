"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StageRecord } from "@/features/stages/types/stage.types";

const stageSchema = z.object({
  name: z.string().min(3, "Informe o nome da etapa"),
  description: z.string().max(180, "Descricao muito longa").optional().or(z.literal("")),
  status: z.enum(["Pending", "InProgress", "Completed"]),
});

export type StageFormValues = z.infer<typeof stageSchema>;

type StageFormProps = {
  initialValues?: StageRecord | null;
  onSubmit: (values: StageFormValues) => Promise<boolean | void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  includeStatus?: boolean;
  resetOnSuccess?: boolean;
};

export function StageForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  includeStatus = true,
  resetOnSuccess = true,
}: StageFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StageFormValues>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Pending",
    },
  });

  useEffect(() => {
    if (!initialValues) {
      reset({
        name: "",
        description: "",
        status: "Pending",
      });
      return;
    }

    reset({
      name: initialValues.name,
      description: initialValues.description ?? "",
      status: initialValues.status,
    });
  }, [initialValues, reset]);

  const submit = async (values: StageFormValues) => {
    const result = await onSubmit(values);
    if (result !== false && resetOnSuccess) {
      reset({
        name: "",
        description: "",
        status: "Pending",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="form-group">
        <label className="form-label" htmlFor="stage-name">Nome da etapa</label>
        <input id="stage-name" className="form-input" {...register("name")} />
        {errors.name ? <p className="field-error">{errors.name.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="stage-description">Descricao</label>
        <input id="stage-description" className="form-input" {...register("description")} />
        {errors.description ? <p className="field-error">{errors.description.message}</p> : null}
      </div>

      {includeStatus ? (
        <div className="form-group">
          <label className="form-label" htmlFor="stage-status">Status</label>
          <select id="stage-status" className="form-input" {...register("status")}>
            <option value="Pending">Pendente</option>
            <option value="InProgress">Em andamento</option>
            <option value="Completed">Concluida</option>
          </select>
          {errors.status ? <p className="field-error">{errors.status.message}</p> : null}
        </div>
      ) : null}

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
