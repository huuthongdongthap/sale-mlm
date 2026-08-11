'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LeaderboardEntry {
  user_id: string;
  name: string;
  level: string;
  total_points: number;
  checkins: number;
  lessons_completed: number;
  rank: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    loadLeaderboard();
    getCurrentUser();
  }, [period]);

  async function getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.id) setCurrentUserId(data.id);
    } catch {}
  }

  async function loadLeaderboard() {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    try {
      const res = await fetch(`/api/leaderboard?period=${period}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLeaderboard(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Hive Academy</h1>
        <div className="space-x-4">
          <a href="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</a>
          <a href="/learn" className="text-gray-600 hover:text-blue-600">Learn</a>
          <a href="/profile" className="text-gray-600 hover:text-blue-600">Profile</a>
          <a href="/community" className="text-gray-600 hover:text-blue-600">Community</a>
          <a href="/leaderboard" className="text-blue-600 font-semibold">Leaderboard</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🏆 Leaderboard</h2>
            <div className="flex gap-2">
              {[
                { key: 'week', label: 'Tuần' },
                { key: 'month', label: 'Tháng' },
                { key: 'year', label: 'Năm' },
                { key: 'all', label: 'Tất cả' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`px-3 py-1 rounded text-sm ${
                    period === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.user_id === currentUserId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      i === 0 ? 'bg-yellow-500' :
                      i === 1 ? 'bg-gray-400' :
                      i === 2 ? 'bg-orange-600' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className={`font-semibold ${entry.user_id === currentUserId ? 'text-blue-600' : ''}`}>
                        {entry.name || 'Unknown'}
                        {entry.user_id === currentUserId && ' (You)'}
                      </p>
                      <p className="text-xs text-gray-500">{entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{entry.total_points} pts</p>
                    <p className="text-xs text-gray-400">
                      {entry.lessons_completed || 0} lessons • {entry.checkins || 0} check-ins
                    </p>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-center text-gray-400 py-8">No data yet</p>
              )}
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">🥇 Top 3</h3>
            <div className="flex justify-center items-end gap-4">
              {/* 2nd */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2">
                  {leaderboard[1]?.name?.charAt(0) || '?'}
                </div>
                <p className="font-semibold">{leaderboard[1]?.name}</p>
                <p className="text-sm text-gray-500">{leaderboard[1]?.total_points} pts</p>
                <div className="mt-2 w-20 h-20 bg-gray-100 rounded-t-lg flex items-center justify-center text-4xl">🥈</div>
              </div>
              {/* 1st */}
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-2">
                  {leaderboard[0]?.name?.charAt(0) || '?'}
                </div>
                <p className="font-bold text-lg">{leaderboard[0]?.name}</p>
                <p className="text-sm text-gray-500">{leaderboard[0]?.total_points} pts</p>
                <div className="mt-2 w-24 h-28 bg-yellow-50 rounded-t-lg flex items-center justify-center text-5xl">🥇</div>
              </div>
              {/* 3rd */}
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2">
                  {leaderboard[2]?.name?.charAt(0) || '?'}
                </div>
                <p className="font-semibold">{leaderboard[2]?.name}</p>
                <p className="text-sm text-gray-500">{leaderboard[2]?.total_points} pts</p>
                <div className="mt-2 w-20 h-16 bg-gray-100 rounded-t-lg flex items-center justify-center text-4xl">🥉</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
