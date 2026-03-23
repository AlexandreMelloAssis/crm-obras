"use client";

type ErrorStateProps = {
  title?: string;
  description: string;
  action?: React.ReactNode;
};

export function ErrorState({
  title = "Nao foi possivel carregar a tela",
  description,
  action,
}: ErrorStateProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="card-subtitle">{description}</p>
        </div>
      </div>
      {action ? <div style={{ marginTop: "0.5rem" }}>{action}</div> : null}
    </div>
  );
}
