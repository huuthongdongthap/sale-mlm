'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LevelBadge from '@/components/LevelBadge';

const LEVELS = ['Khám phá', 'Tân Binh', 'Chiến Binh', 'Chỉ Huy', 'Tướng Quân'];
const LEVEL_COLORS = {
  'Khám phá': 'bg-gray-100 text-gray-700',
  'Tân Binh': 'bg-green-100 text-green-700',
  'Chiến Binh': 'bg-blue-100 text-blue-700',
  'Chỉ Huy': 'bg-purple-100 text-purple-700',
  'Tướng Quân': 'bg-yellow-100 text-yellow-700',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function LearnPage() {
  const { user, token, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [activeLevel, setActiveLevel] = useState('Khám phá');
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (token) {
      fetchLessons();
      fetchProgress();
      fetchPoints();
    }
  }, [token]);

  const fetchLessons = async () => {
    const res = await fetch(`${API_BASE}/api/lessons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setLessons(await res.json());
  };

  const fetchProgress = async () => {
    const res = await fetch(`${API_BASE}/api/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProgress(await res.json());
  };

  const fetchPoints = async () => {
    try {
      const res = await fetch('/api/points/me?period=all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTotalPoints(data.total || 0);
    } catch {}
  };

  const isCompleted = (lessonId) => progress.some((p) => p.lesson_id === lessonId && p.completed);

  const filteredLessons = lessons.filter((l) => l.level === activeLevel);

  if (loading || !user) return <p className="p-8 text-center">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-[#004CE3]">Hive Academy</h1>
            <div className="flex items-center gap-4">
              <LevelBadge points={totalPoints} />
              <span className="text-sm text-gray-600">{user.name}</span>
              <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-sm text-red-600">Đăng xuất</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Học tập</h2>
            <p className="text-gray-600">Hôm nay học gì? Chọn cấp độ để bắt đầu.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-600">⭐ {totalPoints}</p>
            <p className="text-xs text-gray-500">+5 pts / bài học</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeLevel === level ? LEVEL_COLORS[level] + ' ring-2 ring-offset-1 ring-[#004CE3]' : 'bg-white border'}`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => {
            const done = isCompleted(lesson.id);
            return (
              <div key={lesson.id} onClick={() => router.push(`/learn/${lesson.id}`)}
                className="bg-white p-5 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition border-l-4 border-[#004CE3]">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${LEVEL_COLORS[lesson.level]}`}>{lesson.level}</span>
                  {done && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Hoàn thành</span>}
                </div>
                <h3 className="font-semibold text-lg mb-1">{lesson.title}</h3>
                <p className="text-sm text-gray-500">Bài {lesson.order_num}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
