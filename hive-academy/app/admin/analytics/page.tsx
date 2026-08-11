'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function AnalyticsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'leader' && user?.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'leader' || user?.role === 'admin')) {
      loadAnalytics();
    }
  }, [isAuthenticated, user, period]);

  async function loadAnalytics() {
    setLoading(true);
    const token = localStorage.getItem('hive_token');
    try {
      const res = await fetch(`${API}/api/dashboard/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  // Helper for PSN health colors
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      red: 'var(--color-psn-1-critical)',
      yellow: 'var(--color-psn-4-warning)',
      green: 'var(--color-psn-7-stable)',
    };
    return colors[severity] || 'var(--color-text-muted)';
  };

  if (authLoading || !user) return <div className="flex min-h-[60dvh] items-center justify-center text-[var(--color-text-muted)]" style={{ minHeight: '60dvh', color: 'var(--color-text-muted)' }}>Đang tải...</div>;

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
              style={{ color: 'var(--color-text-secondary)' }}>Dashboard</a>
            <a href="/admin/reports" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}>Báo cáo</a>
            <a href="/admin/analytics" className="text-sm text-[var(--color-primary)] font-semibold"
              style={{ color: 'var(--color-primary)' }}>Analytics</a>
          </div>
          <button
            onClick={() => { localStorage.removeItem('hive_token'); localStorage.removeItem('hive_user'); router.push('/login'); }}
            className="text-sm text-[var(--color-destructive)] hover:text-[var(--color-destructive-hover)] transition-colors"
            style={{ color: 'var(--color-destructive)' }}>
            Đăng xuất
          </button>
        </div>
      </nav>

      <div className="container py-8" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <div className="flex justify-between items-center mb-6" style={{ marginBottom: 'var(--space-6)' }}>
          <h2 className="text-display font-bold text-2xl text-[var(--color-text-primary)]"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
            }}>
            Data Analytics
          </h2>
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="input w-auto"
            style={{
              width: 'auto',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
            }}>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="all">Toàn bộ</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="skeleton h-8 w-48 mx-auto" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              <div className="card p-4 text-center" style={{ padding: 'var(--space-4)' }}>
                <p className="text-sm text-[var(--color-text-muted)] mb-1" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Tổng thành viên</p>
                <p className="text-3xl font-bold text-[var(--color-primary)]" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{data.total_members || 0}</p>
              </div>
              <div className="card p-4 text-center" style={{ padding: 'var(--space-4)' }}>
                <p className="text-sm text-[var(--color-text-muted)] mb-1" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Active hôm nay</p>
                <p className="text-3xl font-bold text-[var(--color-success)]" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>{data.active_today || 0}</p>
              </div>
              <div className="card p-4 text-center" style={{ padding: 'var(--space-4)' }}>
                <p className="text-sm text-[var(--color-text-muted)] mb-1" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Đang học</p>
                <p className="text-3xl font-bold text-[var(--color-gold-400)]" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-gold-400)' }}>{data.learning_members || 0}</p>
              </div>
              <div className="card p-4 text-center" style={{ padding: 'var(--space-4)' }}>
                <p className="text-sm text-[var(--color-text-muted)] mb-1" style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Điểm {period === 'week' ? 'tuần' : period === 'month' ? 'tháng' : ''}</p>
                <p className="text-3xl font-bold text-[var(--color-warning)]" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)' }}>{data.points_week || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
              <div className="card p-6" style={{ padding: 'var(--space-6)' }}>
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Phân bố trạng thái</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <span className="relative" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-psn-7-stable)' }} />
                        XANH (Tốt)
                      </span>
                      <span className="font-medium text-[var(--color-psn-7-stable)]" style={{ color: 'var(--color-psn-7-stable)' }}>{data.green_count || 0}</span>
                    </div>
                    <div className="w-full bg-[var(--color-muted)] rounded-full h-2" style={{ backgroundColor: 'var(--color-muted)' }}>
                      <div className="h-2 rounded-full" style={{
                        backgroundColor: 'var(--color-psn-7-stable)',
                        width: `${data.total_members ? (data.green_count || 0) / data.total_members * 100 : 0}%`,
                      }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <span className="relative" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-psn-4-warning)' }} />
                        VÀNG (Cảnh báo)
                      </span>
                      <span className="font-medium text-[var(--color-psn-4-warning)]" style={{ color: 'var(--color-psn-4-warning)' }}>{data.yellow_count || 0}</span>
                    </div>
                    <div className="w-full bg-[var(--color-muted)] rounded-full h-2" style={{ backgroundColor: 'var(--color-muted)' }}>
                      <div className="h-2 rounded-full" style={{
                        backgroundColor: 'var(--color-psn-4-warning)',
                        width: `${data.total_members ? (data.yellow_count || 0) / data.total_members * 100 : 0}%`,
                      }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <span className="relative" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-psn-1-critical)' }} />
                        ĐỎ (Cần chú ý)
                      </span>
                      <span className="font-medium text-[var(--color-psn-1-critical)]" style={{ color: 'var(--color-psn-1-critical)' }}>{data.red_count || 0}</span>
                    </div>
                    <div className="w-full bg-[var(--color-muted)] rounded-full h-2" style={{ backgroundColor: 'var(--color-muted)' }}>
                      <div className="h-2 rounded-full" style={{
                        backgroundColor: 'var(--color-psn-1-critical)',
                        width: `${data.total_members ? (data.red_count || 0) / data.total_members * 100 : 0}%`,
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6" style={{ padding: 'var(--space-6)' }}>
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Top Learners</h3>
                <div className="space-y-2">
                  {(data.top_learners || []).slice(0, 5).map((m: any, i: number) => (
                    <div key={m.id} className="flex justify-between items-center p-2 hover:bg-[var(--color-muted)] rounded" style={{ backgroundColor: 'var(--color-muted)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--color-text-muted)] w-5" style={{ color: 'var(--color-text-muted)' }}>{i + 1}</span>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)' }}>{m.name}</span>
                      </div>
                      <span className="text-sm text-[var(--color-primary)] font-semibold" style={{ color: 'var(--color-primary)' }}>{m.points_week || 0} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-6 mb-6" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Hoạt động theo ngày</h3>
              <div className="flex items-end gap-1 h-32" style={{ gap: 'var(--space-1)' }}>
                {(data.daily_activity || []).map((d: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-[var(--color-primary)] rounded-t" style={{
                      backgroundColor: 'var(--color-primary)',
                      height: `${d.count ? d.count / (data.max_daily || 1) * 100 : 0}%`,
                      minHeight: '2px',
                    }}></div>
                    <span className="text-xs text-[var(--color-text-muted)] mt-1" style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{d.date?.slice(5) || ''}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6" style={{ padding: 'var(--space-6)' }}>
              <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Bài đăng gần đây</h3>
              <p className="text-sm text-[var(--color-text-muted)]" style={{ color: 'var(--color-text-muted)' }}>{data.posts_week || 0} bài trong {period === 'week' ? 'tuần' : period === 'month' ? 'tháng' : ''} qua</p>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-[var(--color-text-muted)]" style={{ color: 'var(--color-text-muted)' }}>Không có dữ liệu</div>
        )}
      </div>
    </main>
  );
}