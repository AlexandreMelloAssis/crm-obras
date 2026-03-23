import { type ReactNode } from "react";
import { Home, Layers, Users, Truck, FileText, DollarSign, ClipboardList, Settings, BarChart3 } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  permission: string;
  requireActiveWork?: boolean;
};

export const APP_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <Home size={18} />, permission: "dashboard.view" },
  { label: "Minhas obras", href: "/obras", icon: <Layers size={18} />, permission: "works.view" },
  { label: "Usuarios da obra", href: "/usuarios", icon: <Users size={18} />, permission: "users.view", requireActiveWork: true },
  { label: "Fornecedores", href: "/fornecedores", icon: <Truck size={18} />, permission: "suppliers.view", requireActiveWork: true },
  { label: "Custos", href: "/custos", icon: <DollarSign size={18} />, permission: "costs.view", requireActiveWork: true },
  { label: "Documentos", href: "/documentos", icon: <FileText size={18} />, permission: "documents.view", requireActiveWork: true },
  { label: "Cotacoes", href: "/cotacoes", icon: <ClipboardList size={18} />, permission: "quotations.view", requireActiveWork: true },
  { label: "Relatorios", href: "/relatorios", icon: <BarChart3 size={18} />, permission: "reports.view", requireActiveWork: true },
  { label: "Configuracoes", href: "/configuracoes", icon: <Settings size={18} />, permission: "settings.view" },
];
