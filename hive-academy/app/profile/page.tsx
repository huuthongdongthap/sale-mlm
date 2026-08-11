'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LEVELS, getLevel, getNextLevel, getProgressInLevel } from '@/lib/gamification';

interface User {
  id: string;
  name: string;
  role: string;
  level: string;
  phone: string;
  team_id: string;
  referrer_id: string;
  created_at: string;
}

interface PointEntry {
  id: string;
  action: string;
  points: number;
  date: string;
}

const ACTION_LABELS: Record<string, string> = {
  checkin_habit: 'Check-in habit',
  lesson_complete: 'Hoàn thành bài học',
  daily_target: 'Đạt target ngày',
  post_share: 'Post chia sẻ',
  perfect_day: 'Perfect Day (6/6)',
  close_order: 'Chốt đơn',
  refer_new: 'Giới thiệu TV mới',
  graduate_level: 'Tốt nghiệp cấp',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [points, setPoints] = useState<PointEntry[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    try {
      const [meRes, ptsRes, lbRes] = await Promise.all([
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/points/me?period=all', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/leaderboard?period=month&limit=10', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const meData = await meRes.json();
      if (!meRes.ok) { router.push('/login'); return; }
      setUser(meData);

      const ptsData = await ptsRes.json();
      setPoints(ptsData.points || []);
      setTotalPoints(ptsData.total || 0);

      const lbData = await lbRes.json();
      setLeaderboard(lbData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  const currentLevel = getLevel(totalPoints);
  const nextLevel = getNextLevel(totalPoints);
  const progress = getProgressInLevel(totalPoints);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Hive Academy</h1>
        <div className="space-x-4">
          <a href="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</a>
          <a href="/learn" className="text-gray-600 hover:text-blue-600">Learn</a>
          <a href="/profile" className="text-blue-600 font-semibold">Profile</a>
          <a href="/community" className="text-gray-600 hover:text-blue-600">Community</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.role} • {user.level}</p>
              <p className="text-sm text-gray-400">{user.phone}</p>
            </div>
          </div>
        </div>

        {/* Level & Points */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: currentLevel.color }}>
                {currentLevel.name}
              </h3>
              <p className="text-3xl font-bold">{totalPoints} pts</p>
            </div>
            {nextLevel && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Next: {nextLevel.name}</p>
                <p className="text-sm font-semibold">{nextLevel.min - totalPoints} pts to go</p>
              </div>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: currentLevel.color }}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">{progress}%</p>

          {/* Level Bar */}
          <div className="flex gap-1 mt-4">
            {LEVELS.map((lv, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded"
                style={{
                  backgroundColor: totalPoints >= lv.min ? lv.color : '#E5E7EB',
                  opacity: totalPoints >= lv.min ? 1 : 0.3,
                }}
                title={lv.name}
              />
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Points" value={totalPoints} color="blue" />
          <StatCard label="Lessons Done" value={points.filter(p => p.action === 'lesson_complete').length} color="green" />
          <StatCard label="Check-ins" value={points.filter(p => p.action === 'checkin_habit').length} color="purple" />
          <StatCard label="Posts" value={points.filter(p => p.action === 'post_share').length} color="yellow" />
        </div>

        {/* Leaderboard Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🏆 Leaderboard (This Month)</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry, i) => (
              <div key={entry.user_id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {i + 1}
                  </span>
                  <span className={entry.user_id === user.id ? 'font-bold text-blue-600' : ''}>
                    {entry.name || 'Unknown'}
                  </span>
                </div>
                <span className="font-semibold">{entry.total_points} pts</span>
              </div>
            ))}
          </div>
          <a href="/leaderboard" className="block text-center text-blue-600 mt-4 text-sm hover:underline">
            View Full Leaderboard →
          </a>
        </div>

        {/* Recent Points */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Points</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {points.slice(0, 20).map((p) => (
              <div key={p.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{ACTION_LABELS[p.action] || p.action}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{p.date}</span>
                  <span className="font-semibold text-green-600">+{p.points}</span>
                </div>
              </div>
            ))}
            {points.length === 0 && (
              <p className="text-gray-400 text-center py-4">No points yet. Start learning!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };
  return (
    <div className={`p-4 rounded-lg ${colors[color] || colors.blue}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}
