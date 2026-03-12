import { PageShell } from '@/components/PageShell';

export default function DashboardPage() {
  return (
    <PageShell title="Dashboard">
      <section className="grid grid-3">
        <div className="card">Obras Ativas: 0</div>
        <div className="card">Custo Total: R$ 0,00</div>
        <div className="card">Documentos Pendentes: 0</div>
      </section>
    </PageShell>
  );
}
