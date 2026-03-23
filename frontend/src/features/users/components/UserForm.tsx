"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserDto } from "@/features/users/types/user.types";

const userFormSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  isActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

type UserFormProps = {
  user: UserDto | null;
  isSubmitting: boolean;
  onSubmit: (values: UserFormValues) => Promise<void>;
  onCancel: () => void;
};

export function UserForm({ user, isSubmitting, onSubmit, onCancel }: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!user) {
      reset({ fullName: "", isActive: true });
      return;
    }

    reset({
      fullName: user.fullName,
      isActive: user.isActive,
    });
  }, [user, reset]);

  if (!user) {
    return (
      <div className="card">
        <p>Selecione um usuario para editar.</p>
      </div>
    );
  }

  const isActive = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label" htmlFor="user-full-name">Nome completo</label>
        <input id="user-full-name" className="form-input" {...register("fullName")} />
        {errors.fullName ? <p className="field-error">{errors.fullName.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="user-email">E-mail</label>
        <input id="user-email" className="form-input" value={user.email} disabled />
      </div>

      <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input id="user-active" type="checkbox" {...register("isActive")} />
        <label className="form-label" htmlFor="user-active" style={{ marginBottom: 0 }}>
          Usuario ativo {isActive ? "(sim)" : "(nao)"}
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
