'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function ReportsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'leader' && user?.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'leader' || user?.role === 'admin')) {
      loadReport();
    }
  }, [isAuthenticated, user]);

  async function loadReport() {
    const token = localStorage.getItem('hive_token');
    try {
      const res = await fetch(`${API}/api/alerts/report/weekly`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  if (!user) return <div className="flex min-h-[60dvh] items-center justify-center text-[var(--color-text-muted)]" style={{ minHeight: '60dvh', color: 'var(--color-text-muted)' }}>Đang tải...</div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]" style={{ minHeight: 'var(--dvh-unit)', backgroundColor: 'var(--color-bg)' }}>
      <nav className="border-b border-[var(--color-surface-border)] bg-[var(--color-surface)]" style={{ borderColor: 'var(--color-surface-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="container flex justify-between h-16 items-center">
          <div className="flex items-center gap-4" style={{ gap: 'var(--space-4)' }}>
            <h1 className="text-display font-bold text-[var(--color-primary)]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-primary)',
              }}>
              Hive Academy
            </h1>
            <a href="/admin" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}>
              Dashboard
            </a>
            <a href="/admin/reports" className="text-sm text-[var(--color-primary)] font-semibold"
              style={{ color: 'var(--color-primary)' }}>
              Reports
            </a>
          </div>
          <button onClick={() => { localStorage.removeItem('hive_token'); localStorage.removeItem('hive_user'); router.push('/login'); }} className="text-sm text-[var(--color-destructive)]"
            style={{ color: 'var(--color-destructive)' }}>
            Đăng xuất
          </button>
        </div>
      </nav>

      <div className="container py-8" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <h2 className="text-display font-bold text-2xl mb-6 text-[var(--color-text-primary)]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-6)',
          }}>
          Báo cáo tuần
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="skeleton h-8 w-48 mx-auto" />
          </div>
        ) : report ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              <div className="card p-4 text-center" style={{ padding: 'var(--space-4)' }}>
                <p className="text-sm text-[var(--color-text-muted)] mb-1" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Tổng thành viên</p>
                <p className="text-3xl font-bold text-[var(--color-primary)]" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{report.total_members}</p>
              </div>
              <div className="card p-4 text-center" style={{ padding: 'var(--space-4)' }}>
                <p className="text-sm text-[var(--color-text-muted)] mb-1" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Tổng Check-in</p>
                <p className="text-3xl font-bold text-[var(--color-success)]" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>{report.total_checkins}</p>
              </div>
              <div className="card p-4 text-center" style={{ padding: 'var(--space-4)' }}>
                <p className="text-sm text-[var(--color-text-muted)] mb-1" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Bài học hoàn thành</p>
                <p className="text-3xl font-bold text-[var(--color-gold-400)]" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-gold-400)' }}>{report.total_lessons}</p>
              </div>
              <div className="card p-4 text-center" style={{ padding: 'var(--space-4)' }}>
                <p className="text-sm text-[var(--color-text-muted)] mb-1" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Tổng điểm</p>
                <p className="text-3xl font-bold text-purple-600" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)' }}>{report.total_points}</p>
              </div>
            </div>

            <div className="card overflow-hidden mb-6" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="px-6 py-4 border-b border-[var(--color-surface-border)]" style={{ padding: 'var(--space-4) var(--space-6)', borderColor: 'var(--color-surface-border)' }}>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)' }}>Chi tiết từng thành viên</h3>
                <p className="text-sm text-[var(--color-text-muted)]" style={{ color: 'var(--color-text-muted)' }}>{report.period}</p>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="px-6 py-3">Thành viên</th>
                      <th className="px-6 py-3">Cấp độ</th>
                      <th className="px-6 py-3">Check-in</th>
                      <th className="px-6 py-3">Bài học</th>
                      <th className="px-6 py-3">Điểm</th>
                      <th className="px-6 py-3">Bài đăng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.members?.map((m: any) => (
                      <tr key={m.id} className="hover:bg-[var(--color-surface-hover)]" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)' }}>{m.name}</p>
                          <p className="text-sm text-[var(--color-text-muted)]" style={{ color: 'var(--color-text-muted)' }}>{m.role}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)' }}>{m.level}</td>
                        <td className="px-6 py-4 text-sm text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)' }}>{m.checkins_week || 0}</td>
                        <td className="px-6 py-4 text-sm text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)' }}>{m.lessons_week || 0}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-[var(--color-primary)]" style={{ color: 'var(--color-primary)' }}>{m.points_week || 0}</td>
                        <td className="px-6 py-4 text-sm text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)' }}>{m.posts_week || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-[var(--color-text-muted)]" style={{ color: 'var(--color-text-muted)' }}>Không có dữ liệu báo cáo</div>
        )}
      </div>
    </main>
  );
}