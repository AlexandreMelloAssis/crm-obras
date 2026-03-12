'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@obra.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.token);
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h1>Gestão de Obras</h1>
        <p>Acesse sua conta</p>
        <form onSubmit={handleSubmit} className="grid">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" />
          {error && <small style={{ color: 'crimson' }}>{error}</small>}
          <button className="button" type="submit">Entrar</button>
        </form>
      </div>
    </main>
  );
}
