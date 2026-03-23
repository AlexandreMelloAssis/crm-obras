"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createUserSchema = z.object({
  fullName: z.string().min(3, "Informe um nome valido"),
  email: z.string().email("Informe um e-mail valido"),
  password: z.string().min(8, "A senha deve ter no minimo 8 caracteres"),
});

export type UserCreateFormValues = z.infer<typeof createUserSchema>;

type UserCreateFormProps = {
  onSubmit: (values: UserCreateFormValues) => Promise<boolean | void>;
  isSubmitting: boolean;
};

export function UserCreateForm({ onSubmit, isSubmitting }: UserCreateFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const handleCreate = async (values: UserCreateFormValues) => {
    const result = await onSubmit(values);
    if (result !== false) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleCreate)}>
      <div className="form-group">
        <label className="form-label" htmlFor="create-user-fullName">Nome completo</label>
        <input id="create-user-fullName" className="form-input" {...register("fullName")} />
        {errors.fullName ? <p className="field-error">{errors.fullName.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="create-user-email">E-mail</label>
        <input id="create-user-email" type="email" className="form-input" {...register("email")} />
        {errors.email ? <p className="field-error">{errors.email.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="create-user-password">Senha inicial</label>
        <input id="create-user-password" type="password" className="form-input" {...register("password")} />
        {errors.password ? <p className="field-error">{errors.password.message}</p> : null}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar usuario"}
        </button>
      </div>
    </form>
  );
}
