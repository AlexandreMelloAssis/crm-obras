import Link from 'next/link';

const items = [
  ['Dashboard', '/dashboard'],
  ['Obras', '/obras'],
  ['Etapas', '/etapas'],
  ['Documentos', '/documentos'],
  ['Materiais', '/materiais'],
  ['Custos', '/custos'],
  ['Financiamento', '/financiamento'],
  ['Configurações', '/configuracoes']
];

export function MainNav() {
  return (
    <nav className="nav">
      {items.map(([label, href]) => (
        <Link key={href} href={href}>{label}</Link>
      ))}
    </nav>
  );
}
