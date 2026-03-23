"use client";

type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = "Carregando",
  description = "Estamos preparando os dados da tela.",
}: LoadingStateProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="card-subtitle">{description}</p>
        </div>
      </div>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div className="stat-card" style={{ minHeight: 72, opacity: 0.65 }} />
        <div className="stat-card" style={{ minHeight: 72, opacity: 0.45 }} />
      </div>
    </div>
  );
}
