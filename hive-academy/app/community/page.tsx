'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';

const CHANNELS = ['Tất cả', 'Kỹ năng bán hàng', 'Chia sẻ kinh nghiệm', 'Thắc mắc', 'Thành công', 'Tâm sự', 'Công cụ'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function CommunityPage() {
  const { user, token, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [activeChannel, setActiveChannel] = useState('Tất cả');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (token) fetchPosts();
  }, [token, activeChannel, refresh]);

  const fetchPosts = async () => {
    const url = new URL(`${API_BASE}/api/posts`);
    if (activeChannel !== 'Tất cả') url.searchParams.set('channel', activeChannel);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setPosts(await res.json());
  };

  const handlePostCreated = () => setRefresh(r => r + 1);

  if (loading || !user) return <div className="flex min-h-[60dvh] items-center justify-center text-[var(--color-text-muted)]" style={{ minHeight: '60dvh', color: 'var(--color-text-muted)' }}>Đang tải...</div>;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]" style={{ minHeight: 'var(--dvh-unit)', backgroundColor: 'var(--color-bg)' }}>
      <nav className="border-b border-[var(--color-surface-border)] bg-[var(--color-surface)]" style={{ borderColor: 'var(--color-surface-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="container flex justify-between h-16 items-center">
          <h1 className="text-display font-bold text-[var(--color-primary)]"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary)',
            }}>
            Hive Academy
          </h1>
          <div className="flex items-center gap-4" style={{ gap: 'var(--space-4)' }}>
            <button onClick={() => router.push('/learn')} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}>
              Học tập
            </button>
            <button onClick={() => router.push('/dashboard')} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}>
              Dashboard
            </button>
            <span className="text-sm text-[var(--color-text-secondary)]" style={{ color: 'var(--color-text-secondary)' }}>{user.name}</span>
            <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-sm text-[var(--color-destructive)] hover:text-[var(--color-destructive-hover)]"
              style={{ color: 'var(--color-destructive)' }}>
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-8" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <div className="mb-6" style={{ marginBottom: 'var(--space-6)' }}>
          <h2 className="text-display font-bold text-3xl mb-2 text-[var(--color-text-primary)]"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}>
            Cộng đồng
          </h2>
          <p className="text-[var(--color-text-secondary)]"
            style={{ color: 'var(--color-text-secondary)' }}>
            Chia sẻ kinh nghiệm, đặt câu hỏi và kết nối với đồng đội.
          </p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`btn rounded-full ${activeChannel === ch ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {ch}
            </button>
          ))}
        </div>

        <CreatePost token={token} onPostCreated={handlePostCreated} />
        <div className="mt-6 space-y-4" style={{ marginTop: 'var(--space-6)' }}>
          {posts.length === 0 && (
            <div className="empty-state" style={{ padding: 'var(--space-12) var(--space-4)' }}>
              <p className="text-center text-[var(--color-text-muted)]" style={{ color: 'var(--color-text-muted)' }}>
                Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!
              </p>
            </div>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onLike={(id) => {
                fetch(`${API_BASE}/api/posts/${id}/like`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` },
                }).then(() => handlePostCreated());
              }}
              onComment={() => {}}
              onShare={() => {}}
            />
          ))}
        </div>
      </div>
    </main>
  );
}