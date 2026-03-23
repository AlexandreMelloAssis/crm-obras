"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { WorkSelector } from "@/features/works/components/WorkSelector";
import { usePermissions } from "@/features/works/hooks/usePermissions";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiredPermission?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", requiredPermission: "dashboard.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { label: "Obras", href: "/obras", requiredPermission: "works.select.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v13"/><path d="M21 8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v13"/><path d="M14 8V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"/><path d="M7 12h10"/><path d="M7 16h10"/></svg> },
  { label: "Usuarios", href: "/usuarios", requiredPermission: "users.manage.update", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg> },
  { label: "Fornecedores", href: "/fornecedores", requiredPermission: "suppliers.manage.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg> },
  { label: "Cotacoes", href: "/cotacoes", requiredPermission: "quotations.manage.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h10"/><path d="M17 17l2 2 4-4"/></svg> },
  { label: "Etapas", href: "/etapas", requiredPermission: "works.manage.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { label: "Documentos", href: "/documentos", requiredPermission: "documents.manage.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg> },
  { label: "Materiais", href: "/materiais", requiredPermission: "works.manage.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.5 7.278l.5.5c.5.5.5 1.5 0 2l-8 8c-.5.5-1.5.5-2 0l-.5-.5"/><path d="M12 2l3 3-8 8-3-3 8-8z"/><path d="M2 12l3 3"/><path d="M7.5 7.5l3 3"/><path d="M22 22H2"/></svg> },
  { label: "Custos", href: "/custos", requiredPermission: "costs.manage.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg> },
  { label: "Financiamento", href: "/financiamento", requiredPermission: "works.manage.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
  { label: "Relatorios", href: "/relatorios", requiredPermission: "reports.view", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { label: "Auditoria", href: "/auditoria", requiredPermission: "users.manage.update", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg> },
  { label: "Configuracoes", href: "/configuracoes", requiredPermission: "works.manage.update", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 17) return "Boa tarde";
  return "Boa noite";
}

export function DayNightLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setThemeState] = useState<"snow" | "carbon">("snow");

  const isActive = useCallback(
    (href: string) => pathname === href || pathname?.startsWith(href + "/"),
    [pathname]
  );

  const greeting = useMemo(() => getGreeting(), []);
  const userLabel = useMemo(() => user?.fullName || user?.email || "Usuario", [user]);
  const userInitial = useMemo(() => userLabel.charAt(0).toUpperCase(), [userLabel]);
  const filteredNavItems = useMemo(
    () => navItems.filter((item) => !item.requiredPermission || can(item.requiredPermission)),
    [can]
  );

  useEffect(() => {
    const dayNightTheme = localStorage.getItem("daynight-theme");
    const legacyTheme = localStorage.getItem("crm-obras:theme");
    const shouldUseDark = dayNightTheme === "carbon" || legacyTheme === "dark";

    if (shouldUseDark) {
      document.documentElement.classList.add("carbon");
      document.documentElement.classList.remove("snow");
      setThemeState("carbon");
    } else {
      document.documentElement.classList.add("snow");
      document.documentElement.classList.remove("carbon");
      setThemeState("snow");
    }

    const storedSidebar = localStorage.getItem("daynight-sidebar-collapsed");
    setSidebarCollapsed(storedSidebar === "1");
  }, []);

  const setTheme = (themeValue: "snow" | "carbon") => {
    if (themeValue === "carbon") {
      document.documentElement.classList.add("carbon");
      document.documentElement.classList.remove("snow");
      localStorage.setItem("daynight-theme", "carbon");
      localStorage.setItem("crm-obras:theme", "dark");
    } else {
      document.documentElement.classList.add("snow");
      document.documentElement.classList.remove("carbon");
      localStorage.setItem("daynight-theme", "snow");
      localStorage.setItem("crm-obras:theme", "light");
    }
    setThemeState(themeValue);
  };

  const toggleMobileMenu = () => setMobileOpen((v) => !v);
  const closeMobileMenu = () => setMobileOpen(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("daynight-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className={`app-container ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className={`mobile-menu-overlay ${mobileOpen ? "active" : ""}`} onClick={closeMobileMenu} />
      <div className={`mobile-menu ${mobileOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <Link href="/dashboard" className="logo" onClick={closeMobileMenu}>
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm8-11l-1 5h2l-1-5zm-4 2h2l1-3h-4l1 3zm8 0h2l1-3h-4l1 3zm-3-4l1-2h2l1 2h-4zm4 4h2l1-3h-4l1 3z" />
              </svg>
            </div>
            Obra Facil
          </Link>
          <button className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Fechar menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="mobile-menu-nav">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
              onClick={closeMobileMenu}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <div className="mobile-work-selector">
            <WorkSelector compact />
          </div>
          <button type="button" className="mobile-logout-btn" onClick={logout} title="Sair da aplicacao">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
              <polyline points="17 9 22 14 17 19" />
              <line x1="22" y1="14" x2="10" y2="14" />
            </svg>
            Sair
          </button>
          <div className="theme-toggle">
            <button
              type="button"
              className={`theme-btn theme-btn-snow ${theme === "snow" ? "active" : ""}`}
              onClick={() => setTheme("snow")}
              title="Snow Edition"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </button>
            <button
              type="button"
              className={`theme-btn theme-btn-carbon ${theme === "carbon" ? "active" : ""}`}
              onClick={() => setTheme("carbon")}
              title="Carbon Edition"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-left">
            <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Abrir menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            <button className="desktop-sidebar-btn" onClick={toggleSidebar} aria-label="Expandir ou recolher menu lateral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            <Link href="/dashboard" className="logo">
              Obra Facil
            </Link>
          </div>

          <div className="nav-right">
            <div className="header-actions">
              <div className="header-work-selector">
                <WorkSelector compact />
              </div>

              <div className="theme-toggle">
                <button
                  type="button"
                  className={`theme-btn theme-btn-snow ${theme === "snow" ? "active" : ""}`}
                  onClick={() => setTheme("snow")}
                  title="Modo claro"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`theme-btn theme-btn-carbon ${theme === "carbon" ? "active" : ""}`}
                  onClick={() => setTheme("carbon")}
                  title="Modo escuro"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </button>
              </div>

              <button className="user-menu" type="button" title={`${greeting}, ${userLabel}`}>
                <div className="user-avatar">{userInitial}</div>
                <div className="user-info">
                  <div className="user-name">{userLabel}</div>
                </div>
              </button>

              <button type="button" className="btn-logout" title="Sair" onClick={logout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
                  <polyline points="17 9 22 14 17 19" />
                  <line x1="22" y1="14" x2="10" y2="14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="app-body">
        <aside className={`side-nav ${sidebarCollapsed ? "collapsed" : ""}`}>
          <nav className="side-nav-menu">
            {filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href} className={`side-nav-link ${isActive(item.href) ? "active" : ""}`} title={item.label}>
                <span className="side-nav-icon">{item.icon}</span>
                <span className="side-nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
