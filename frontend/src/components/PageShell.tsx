import { MainNav } from './MainNav';

export function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="container">
      <MainNav />
      <h1>{title}</h1>
      {children}
    </main>
  );
}
