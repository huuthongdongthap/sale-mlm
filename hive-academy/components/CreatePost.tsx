'use client';

import { useState } from 'react';
import { Send, X } from 'lucide-react';

const CHANNELS = ['Kỹ năng bán hàng', 'Chia sẻ kinh nghiệm', 'Thắc mắc', 'Thành công', 'Tâm sự', 'Công cụ'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function CreatePost({ token, onPostCreated }) {
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('Chia sẻ kinh nghiệm');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, channel }),
      });
      if (res.ok) {
        setContent('');
        onPostCreated();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)' }}>
      <form onSubmit={handleSubmit}>
        <div className="relative mb-3" style={{ marginBottom: 'var(--space-3)' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ điều gì đó với cộng đồng..."
            className="input w-full resize-none"
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              minHeight: '100px',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-normal)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
            rows={4}
            aria-label="Nội dung bài viết"
          />
          {content.length > 0 && (
            <button
              type="button"
              onClick={() => setContent('')}
              className="absolute top-2 right-2 p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] transition-colors"
              style={{
                top: 'var(--space-2)',
                right: 'var(--space-2)',
                padding: 'var(--space-1)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-muted)',
              }}
              aria-label="Xóa nội dung"
            >
              <X size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex justify-between items-center" style={{ gap: 'var(--space-3)' }}>
          <div className="relative" style={{ flex: 1, maxWidth: '300px' }}>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="input w-full appearance-none pr-10"
              style={{
                width: '100%',
                paddingRight: 'var(--space-10)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}
              aria-label="Chọn chuyên mục"
            >
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" aria-hidden="true">
              <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="btn btn-primary flex items-center gap-2"
            style={{
              minHeight: 'var(--touch-target-min)',
              padding: 'var(--space-2) var(--space-4)',
            }}
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang đăng...
              </>
            ) : (
              <>
                <Send size={18} strokeWidth={2.5} aria-hidden="true" />
                Đăng bài
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}