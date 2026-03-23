"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { WorkDto } from "@/features/works/types/work.types";

const workStatusValues = ["Planning", "InProgress", "Paused", "Completed"] as const;

const workSchema = z.object({
  name: z.string().min(3, "Informe pelo menos 3 caracteres para o nome"),
  address: z
    .string()
    .min(5, "Informe o endereco da obra")
    .max(160, "Endereco muito longo"),
  status: z.enum(workStatusValues),
});

export type WorkFormValues = z.infer<typeof workSchema>;

type WorkFormProps = {
  initialValues?: WorkDto | null;
  onSubmit: (values: WorkFormValues) => Promise<boolean | void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  includeStatus?: boolean;
  resetOnSuccess?: boolean;
};

export function WorkForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  includeStatus = true,
  resetOnSuccess = true,
}: WorkFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkFormValues>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      name: "",
      address: "",
      status: "Planning",
    },
  });

  useEffect(() => {
    if (!initialValues) {
      reset({
        name: "",
        address: "",
        status: "Planning",
      });
      return;
    }

    reset({
      name: initialValues.name ?? "",
      address: initialValues.address ?? "",
      status: (initialValues.status as WorkFormValues["status"]) ?? "Planning",
    });
  }, [initialValues, reset]);

  const submit = async (values: WorkFormValues) => {
    const result = await onSubmit(values);
    if (result !== false && resetOnSuccess) {
      reset({
        name: "",
        address: "",
        status: "Planning",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="form-group">
        <label className="form-label" htmlFor="work-name">Nome da obra</label>
        <input id="work-name" className="form-input" placeholder="Ex.: Residencial Bela Vista" {...register("name")} />
        {errors.name ? <p className="field-error">{errors.name.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="work-address">Endereco</label>
        <input id="work-address" className="form-input" placeholder="Rua, numero, bairro e cidade" {...register("address")} />
        {errors.address ? <p className="field-error">{errors.address.message}</p> : null}
      </div>

      {includeStatus ? (
        <div className="form-group">
          <label className="form-label" htmlFor="work-status">Status</label>
          <select id="work-status" className="form-input" {...register("status")}>
            <option value="Planning">Planejamento</option>
            <option value="InProgress">Em andamento</option>
            <option value="Paused">Pausada</option>
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
