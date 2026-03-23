"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useWork } from "@/features/works/context/WorkContext";
import { usePermissions } from "@/features/works/hooks/usePermissions";
import { LoadingState } from "@/shared/components/common/LoadingState";
import { StatCard } from "@/shared/components/common/StatCard";
import { useAppSettings } from "@/shared/hooks/useAppSettings";

const permissionGroups = [
  {
    title: "Administracao",
    permissions: ["users.manage.update", "users.manage.delete", "works.manage.update", "works.manage.delete"],
  },
  {
    title: "Operacao",
    permissions: ["suppliers.manage.write", "costs.manage.write", "documents.manage.upload", "quotations.manage.write"],
  },
  {
    title: "Consulta",
    permissions: ["dashboard.view", "reports.view", "works.select.view", "documents.manage.view"],
  },
];

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { currentWork, works } = useWork();
  const { can } = usePermissions();
  const { settings, setSetting, isReady } = useAppSettings();

  if (!isReady) {
    return (
      <PageShell
        title="Configuracoes"
        subtitle="Preferencias operacionais e resumo de autorizacao visual."
        requiredPermission="works.manage.update"
      >
        <LoadingState title="Carregando preferencias" description="Estamos preparando suas configuracoes locais." />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Configuracoes"
      subtitle="Preferencias operacionais, contexto atual e matriz de autorizacao visual."
      requiredPermission="works.manage.update"
    >
      <div className="stats-grid">
        <StatCard label="Usuario ativo" value={user?.fullName || user?.email || "-"} helper="Sessao autenticada" />
        <StatCard label="Obras disponiveis" value={works.length} helper="Escopo autorizado" />
        <StatCard label="Obra ativa" value={currentWork?.name || "Nenhuma"} helper="Contexto operacional atual" />
        <StatCard label="Landing page" value={settings.defaultLandingPage} helper="Preferencia local salva" />
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Preferencias locais</h3>
              <p className="card-subtitle">Comportamentos salvos no navegador do usuario.</p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <span>Cards compactos no dashboard</span>
              <input type="checkbox" checked={settings.compactCards} onChange={(e) => setSetting("compactCards", e.target.checked)} />
            </label>

            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <span>Atualizacao automatica de indicadores</span>
              <input
                type="checkbox"
                checked={settings.autoRefreshDashboard}
                onChange={(e) => setSetting("autoRefreshDashboard", e.target.checked)}
              />
            </label>

            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <span>Alertas operacionais visuais</span>
              <input
                type="checkbox"
                checked={settings.enableOperationAlerts}
                onChange={(e) => setSetting("enableOperationAlerts", e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Preferencias de navegacao</h3>
              <p className="card-subtitle">Defina os atalhos mais relevantes para sua rotina.</p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="default-landing-page">Tela inicial preferida</label>
              <select
                id="default-landing-page"
                className="form-input"
                value={settings.defaultLandingPage}
                onChange={(e) => setSetting("defaultLandingPage", e.target.value as typeof settings.defaultLandingPage)}
              >
                <option value="/dashboard">Dashboard</option>
                <option value="/obras">Obras</option>
                <option value="/relatorios">Relatorios</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="preferred-work-module">Modulo preferido da obra</label>
              <select
                id="preferred-work-module"
                className="form-input"
                value={settings.preferredWorkModule}
                onChange={(e) => setSetting("preferredWorkModule", e.target.value as typeof settings.preferredWorkModule)}
              >
                <option value="/custos">Custos</option>
                <option value="/documentos">Documentos</option>
                <option value="/etapas">Etapas</option>
                <option value="/cotacoes">Cotacoes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Contexto atual</h3>
              <p className="card-subtitle">Informacoes da sessao autenticada e do escopo de obra.</p>
            </div>
          </div>

          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
            <li>Usuario: <strong>{user?.fullName || user?.email || "-"}</strong></li>
            <li>E-mail: <strong>{user?.email || "-"}</strong></li>
            <li>Obra ativa: <strong>{currentWork?.name || "Nenhuma"}</strong></li>
            <li>Endereco da obra: <strong>{currentWork?.address || "Nao informado"}</strong></li>
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Atalhos rapidos</h3>
              <p className="card-subtitle">Acesse os pontos mais usados com um clique.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link className="btn btn-secondary" href={settings.defaultLandingPage}>
              Abrir tela inicial
            </Link>
            <Link className="btn btn-secondary" href={settings.preferredWorkModule}>
              Abrir modulo preferido
            </Link>
            <Link className="btn btn-primary" href="/dashboard">
              Voltar ao dashboard
            </Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", display: "grid", gap: "1.5rem" }}>
        {permissionGroups.map((group) => (
          <div key={group.title} className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">{group.title}</h3>
                <p className="card-subtitle">Permissoes visuais calculadas no frontend para este grupo.</p>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Permissao</th>
                    <th>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {group.permissions.map((permission) => (
                    <tr key={permission}>
                      <td>{permission}</td>
                      <td>
                        {can(permission) ? <span className="badge badge-green">Permitido</span> : <span className="badge badge-red">Bloqueado</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
