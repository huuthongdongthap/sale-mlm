'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function LessonDetailPage({ params }: { params: { id: string } }) {
  const { token, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (token && params.id) fetchLesson();
  }, [token, params.id]);

  const fetchLesson = async () => {
    const res = await fetch(`${API_BASE}/api/lessons/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setLesson(data);
      setQuizAnswers(new Array(data.quiz?.length || 0).fill(-1));
    }
  };

  const handleQuizChange = (qIndex, optionIndex) => {
    const newAnswers = [...quizAnswers];
    newAnswers[qIndex] = optionIndex;
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    if (quizAnswers.some((a) => a === -1)) return alert('Vui lòng trả lời tất cả câu hỏi');
    setSubmitting(true);

    let score = 0;
    lesson.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) score++;
    });
    const percent = Math.round((score / lesson.quiz.length) * 100);

    await fetch(`${API_BASE}/api/progress/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ lesson_id: lesson.id, score: percent }),
    });

    setQuizResult({ score, total: lesson.quiz.length, percent });
    setSubmitting(false);
  };

  if (loading || !lesson) return <p className="p-8 text-center">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button onClick={() => router.push('/learn')} className="text-[#004CE3] text-sm">← Quay lại</button>
            <h1 className="text-xl font-bold text-[#004CE3]">Hive Academy</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{lesson.level}</span>
          <h2 className="text-2xl font-bold mt-2 mb-4">{lesson.title}</h2>

          {lesson.video_url && (
            <div className="aspect-video mb-6">
              <iframe src={lesson.video_url} className="w-full h-full rounded" allowFullScreen />
            </div>
          )}

          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>

        {lesson.quiz && !quizResult && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Bài kiểm tra</h3>
            {lesson.quiz.map((q, qi) => (
              <div key={qi} className="mb-6 pb-6 border-b">
                <p className="font-medium mb-3">{qi + 1}. {q.q}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center p-3 border rounded cursor-pointer ${quizAnswers[qi] === oi ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name={`q-${qi}`} checked={quizAnswers[qi] === oi} onChange={() => handleQuizChange(qi, oi)} className="mr-3" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submitQuiz} disabled={submitting} className="bg-[#004CE3] text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>
        )}

        {quizResult && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Kết quả</h3>
            <p className="text-3xl font-bold text-[#004CE3]">{quizResult.percent}%</p>
            <p className="text-gray-600">Đúng {quizResult.score}/{quizResult.total} câu</p>
            <button onClick={() => router.push('/learn')} className="mt-4 bg-[#FFC734] text-black px-6 py-2 rounded hover:bg-yellow-400">
              Tiếp tục học
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
