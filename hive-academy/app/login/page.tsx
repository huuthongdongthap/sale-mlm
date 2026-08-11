'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80dvh] items-center justify-center p-4" style={{ minHeight: '80dvh', padding: 'var(--space-4)' }}>
      <div className="w-full max-w-md card p-8" style={{ maxWidth: '28rem', padding: 'var(--space-8)' }}>
        <h1 className="text-display font-bold text-4xl text-center text-[var(--color-primary)] mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-2)',
          }}>
          Hive Academy
        </h1>
        <h2 className="text-xl text-center text-[var(--color-text-secondary)] mb-6"
          style={{
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
          }}>
          Đăng nhập
        </h2>

        {error && (
          <div className="alert alert-destructive mb-4" role="alert"
            style={{ marginBottom: 'var(--space-4)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" style={{ gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="phone" className="label" style={{ marginBottom: 'var(--space-1)' }}>
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="0901234567"
              required
              autoComplete="tel"
            />
          </div>

          <div>
            <label htmlFor="password" className="label" style={{ marginBottom: 'var(--space-1)' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full btn-lg"
            style={{ minHeight: 'var(--touch-target-comfortable)' }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]"
          style={{ marginTop: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
          Chưa có tài khoản?{' '}
          <a href="/register" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline"
            style={{ color: 'var(--color-primary)' }}>
            Đăng ký ngay
          </a>
        </p>
      </div>
    </main>
  );
}