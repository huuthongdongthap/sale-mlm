'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Member {
  id: string; name: string; phone: string; role: string; level: string;
  team_id?: string; last_checkin?: string; lessons_done: number; points_total: number;
  alert_severity?: string; days_inactive?: number; today_habits?: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, red: 0, yellow: 0, green: 0, todayActive: 0 });
  const [filter, setFilter] = useState('all');
  const [loadingData, setLoadingData] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== 'leader' && user?.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'leader' || user?.role === 'admin')) {
      loadData();
      loadAnalytics();
    }
  }, [isAuthenticated, user]);

  async function loadData() {
    setLoadingData(true);
    const token = localStorage.getItem('hive_token');
    try {
      const [membersRes, alertsRes] = await Promise.all([
        fetch(`${API}/api/dashboard/members`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/alerts`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (membersRes.ok) { const d = await membersRes.json(); setMembers(d); calcStats(d); }
      if (alertsRes.ok) { const d = await alertsRes.json(); setAlerts(d); }
    } catch (e) { console.error('Load error:', e); }
    setLoadingData(false);
  }

  async function loadAnalytics() {
    const token = localStorage.getItem('hive_token');
    try {
      const res = await fetch(`${API}/api/dashboard/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAnalytics(await res.json());
    } catch (e) { console.error(e); }
  }

  function calcStats(data: Member[]) {
    setStats({
      total: data.length,
      red: data.filter(m => m.alert_severity === 'red').length,
      yellow: data.filter(m => m.alert_severity === 'yellow').length,
      green: data.filter(m => m.alert_severity === 'green' || !m.alert_severity).length,
      todayActive: data.filter(m => (m.today_habits || 0) >= 4).length,
    });
  }

  async function generateAlerts() {
    const token = localStorage.getItem('hive_token');
    await fetch(`${API}/api/alerts/generate`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    });
    loadData();
  }

  async function resolveAlert(alertId: string) {
    const token = localStorage.getItem('hive_token');
    await fetch(`${API}/api/alerts/resolve/${alertId}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }
    });
    loadData();
  }

  function severityBadge(s: string | undefined) {
    if (s === 'red') return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded font-semibold">🔴 ĐỎ</span>;
    if (s === 'yellow') return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded font-semibold">🟡 VÀNG</span>;
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-semibold">🟢 XANH</span>;
  }

  const filteredMembers = members.filter(m => {
    if (filter === 'red') return m.alert_severity === 'red';
    if (filter === 'yellow') return m.alert_severity === 'yellow';
    if (filter === 'green') return !m.alert_severity || m.alert_severity === 'green';
    return true;
  });

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-[#004CE3]">Hive Academy</h1>
              <a href="/admin" className="text-sm text-[#004CE3] font-semibold">Dashboard</a>
              <a href="/admin/reports" className="text-sm text-gray-600 hover:text-[#004CE3]">Báo cáo</a>
              <a href="/admin/analytics" className="text-sm text-gray-600 hover:text-[#004CE3]">Analytics</a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.name} ({user.role})</span>
              <button onClick={() => { localStorage.removeItem('hive_token'); localStorage.removeItem('hive_user'); router.push('/login'); }} className="text-sm text-red-600">Đăng xuất</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-500">Tổng thành viên</p>
            <p className="text-3xl font-bold text-[#004CE3]">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer" onClick={() => setFilter('red')}>
            <p className="text-sm text-gray-500">🔴 ĐỎ</p>
            <p className="text-3xl font-bold text-red-600">{stats.red}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer" onClick={() => setFilter('yellow')}>
            <p className="text-sm text-gray-500">🟡 VÀNG</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.yellow}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer" onClick={() => setFilter('green')}>
            <p className="text-sm text-gray-500">🟢 XANH</p>
            <p className="text-3xl font-bold text-green-600">{stats.green}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-500">✅ Active hôm nay</p>
            <p className="text-3xl font-bold text-green-600">{stats.todayActive}</p>
          </div>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">Active hôm nay</p>
              <p className="text-3xl font-bold text-green-600">{analytics.active_today || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">Đang học</p>
              <p className="text-3xl font-bold text-[#FFC734]">{analytics.learning_members || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">Bài đăng tuần</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.posts_week || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">Điểm tuần</p>
              <p className="text-3xl font-bold text-orange-600">{analytics.points_week || 0}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {['all', 'red', 'yellow', 'green'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded text-sm ${filter === f ? 'bg-[#004CE3] text-white' : 'bg-white text-gray-700'}`}>
                {f === 'all' ? 'Tất cả' : f === 'red' ? '🔴 ĐỎ' : f === 'yellow' ? '🟡 VÀNG' : '🟢 XANH'}
              </button>
            ))}
          </div>
          <button onClick={generateAlerts} className="px-4 py-2 bg-[#FFC734] text-black rounded text-sm font-semibold">
            🔄 Tạo cảnh báo
          </button>
        </div>

        {alerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Cảnh báo chưa xử lý ({alerts.length})</h3>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((a: any) => (
                <div key={a.id} className={`p-3 rounded-lg flex justify-between items-center
                  ${a.level === 'red' ? 'bg-red-50 border border-red-200' :
                    a.level === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-green-50 border border-green-200'}`}>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.user_name} ({a.level})</p>
                    <p className="text-xs text-gray-600">{a.reason}</p>
                  </div>
                  <button onClick={() => resolveAlert(a.id)} className="text-xs text-gray-500 hover:text-gray-700 ml-2">
                    ✓ Đã xử lý
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Danh sách thành viên ({filteredMembers.length})</h3>
          </div>
          {loadingData ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành viên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cấp độ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bài đã học</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Habits hôm nay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{m.name}</p>
                        <p className="text-sm text-gray-500">{m.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{m.level}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{m.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{m.lessons_done || 0}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#004CE3]">{m.points_total || 0}</td>
                    <td className="px-6 py-4 text-sm">{m.today_habits || 0}/6</td>
                    <td className="px-6 py-4">{severityBadge(m.alert_severity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
