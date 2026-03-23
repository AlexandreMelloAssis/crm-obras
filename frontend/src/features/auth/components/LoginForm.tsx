"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { parseApiError } from "@/shared/utils/apiError";
import { useAppSettings } from "@/shared/hooks/useAppSettings";

const loginSchema = z.object({
  email: z.string().email("E-mail invalido"),
  password: z.string().min(6, "A senha deve ter no minimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const { settings } = useAppSettings();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      });
      const next = searchParams.get("next");
      window.location.href = next || settings.defaultLandingPage || "/dashboard";
    } catch (err) {
      setServerError(parseApiError(err, "Erro ao autenticar"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <div className="form-group">
        <label className="form-label" htmlFor="email">E-mail</label>
        <input id="email" type="email" className="form-input" placeholder="voce@empresa.com" {...register("email")} />
        {errors.email ? <p className="field-error">{errors.email.message}</p> : null}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">Senha</label>
        <input id="password" type="password" className="form-input" placeholder="Digite sua senha" {...register("password")} />
        {errors.password ? <p className="field-error">{errors.password.message}</p> : null}
      </div>

      {serverError ? <p className="field-error">{serverError}</p> : null}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary">
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
