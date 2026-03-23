"use client";

type PermissionDeniedStateProps = {
  title?: string;
  description?: string;
};

export function PermissionDeniedState({
  title = "Acesso bloqueado",
  description = "Seu perfil atual nao possui permissao para acessar esta tela.",
}: PermissionDeniedStateProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="card-subtitle">{description}</p>
        </div>
      </div>
      <span className="badge badge-red">Permissao necessaria</span>
    </div>
  );
}
