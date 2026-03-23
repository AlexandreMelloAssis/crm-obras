"use client";

import { useEffect, useMemo } from "react";
import { useWork } from "@/features/works/context/WorkContext";

type WorkSelectorProps = {
  compact?: boolean;
};

export function WorkSelector({ compact = false }: WorkSelectorProps) {
  const { works, currentWork, setCurrentWork, isLoading } = useWork();

  const options = useMemo(
    () => works.map((work) => ({ value: work.id, label: work.name })),
    [works]
  );

  useEffect(() => {
    if (!currentWork && works.length) {
      setCurrentWork(works[0].id);
    }
  }, [currentWork, works, setCurrentWork]);

  if (isLoading) {
    return compact ? (
      <div style={{ fontSize: "12px", opacity: 0.75 }}>Carregando obras...</div>
    ) : (
      <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">Carregando obras...</div>
    );
  }

  if (!currentWork) {
    return compact ? (
      <div style={{ fontSize: "12px", opacity: 0.75 }}>Nenhuma obra disponivel</div>
    ) : (
      <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        Nenhuma obra disponivel
      </div>
    );
  }

  if (compact) {
    return (
      <select
        aria-label="Selecionar obra ativa"
        value={currentWork.id}
        onChange={(event) => setCurrentWork(event.target.value)}
        className="form-input"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Obra ativa
      </label>
      <select
        value={currentWork.id}
        onChange={(event) => setCurrentWork(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}