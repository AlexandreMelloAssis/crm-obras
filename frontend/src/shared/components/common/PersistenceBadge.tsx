"use client";

export type PersistenceMode = "backend" | "local" | "hybrid";

type PersistenceBadgeProps = {
  mode: PersistenceMode;
  label?: string;
};

const defaultLabels: Record<PersistenceMode, string> = {
  backend: "Backend",
  local: "Local",
  hybrid: "Hibrido",
};

export function PersistenceBadge({ mode, label }: PersistenceBadgeProps) {
  return <span className={`badge persistence-badge persistence-${mode}`}>{label ?? defaultLabels[mode]}</span>;
}

type PersistenceNoticeProps = {
  mode: PersistenceMode;
  title: string;
  description: string;
};

export function PersistenceNotice({ mode, title, description }: PersistenceNoticeProps) {
  return (
    <div className={`persistence-notice persistence-${mode}`}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <strong>{title}</strong>
        <PersistenceBadge mode={mode} />
      </div>
      <p>{description}</p>
    </div>
  );
}
