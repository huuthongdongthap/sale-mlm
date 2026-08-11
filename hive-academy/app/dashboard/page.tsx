'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LevelBadge from '@/components/LevelBadge';
import { getLevel, getProgressInLevel } from '@/lib/gamification';

interface PointsData {
  total: number;
  points: any[];
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) loadPoints();
  }, [user]);

  async function loadPoints() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/points/me?period=all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPointsData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPoints(false);
    }
  }

  if (loading || loadingPoints) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) return null;

  const totalPoints = pointsData?.total || 0;
  const currentLevel = getLevel(totalPoints);
  const progress = getProgressInLevel(totalPoints);

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-[#004CE3]">Hive Academy</h1>
            <div className="flex items-center gap-4">
              <LevelBadge points={totalPoints} />
              <span className="text-sm text-gray-600">
                {user.name} ({user.role})
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">Chào mừng</h3>
            <p className="text-gray-600 mt-2">Welcome to Hive Academy, {user.name}!</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">Cấp độ</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: currentLevel.color }}>
              {currentLevel.name}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${progress}%`, backgroundColor: currentLevel.color }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}% to next level</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">Điểm số</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">⭐ {totalPoints} pts</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/learn" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md text-center">
            <p className="font-semibold">📚 Học</p>
          </a>
          <a href="/community" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md text-center">
            <p className="font-semibold">💬 Chia sẻ</p>
          </a>
          <a href="/profile" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md text-center">
            <p className="font-semibold">👤 Profile</p>
          </a>
          <a href="/leaderboard" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md text-center">
            <p className="font-semibold">🏆 Bảng xếp hạng</p>
          </a>
        </div>
      </div>
    </main>
  );
}
