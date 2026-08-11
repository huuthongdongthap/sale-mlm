'use client';

import { Heart, MessageSquare, Share2, Heart as HeartSolid, MessageSquare as MessageSquareSolid } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

export default function PostCard({ post, currentUser, onLike, onComment, onShare }) {
  const isLiked = post.likes?.some(like => like.user_id === currentUser?.id);
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;

  const handleLike = async () => {
    if (onLike) await onLike(post.id);
  };

  const handleShare = async () => {
    if (onShare) await onShare(post.id);
  };

  return (
    <article
      className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-[var(--radius-xl)] overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-md)]"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-border)', borderRadius: 'var(--radius-xl)' }}
    >
      <div className="p-4" style={{ padding: 'var(--space-4)' }}>
        {/* Author Header */}
        <div className="flex items-center gap-3 mb-3" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold-400)] to-[var(--color-gold-600)] flex items-center justify-center text-white font-bold text-lg"
            style={{
              width: 'var(--touch-target-comfortable)',
              height: 'var(--touch-target-comfortable)',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(to bottom right, var(--color-gold-400), var(--color-gold-600))',
            }}>
            {post.author?.display_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${post.author?.id}`}
              className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors truncate block"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {post.author?.display_name || 'Unknown'}
            </Link>
            <time
              className="text-xs text-[var(--color-text-muted)]"
              dateTime={post.created_at}
              style={{ color: 'var(--color-text-muted)' }}
            >
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: vi })}
            </time>
          </div>
        </div>

        {/* Content */}
        <div
          className="text-[var(--color-text-primary)] whitespace-pre-wrap break-words mb-4"
          style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}
        >
          {post.content}
        </div>

        {/* Image if exists */}
        {post.image_url && (
          <div className="mb-4 rounded-[var(--radius-lg)] overflow-hidden" style={{ marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
            <img
              src={post.image_url}
              alt={`Post image by ${post.author?.display_name}`}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-surface-border)]"
          style={{ paddingTop: 'var(--space-3)', borderTopColor: 'var(--color-surface-border)' }}>
          <div className="flex items-center gap-1" style={{ gap: 'var(--space-1)' }}>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-150 touch-target`}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isLiked ? 'var(--color-gold-100)' : 'transparent',
                color: isLiked ? 'var(--color-gold-600)' : 'var(--color-text-secondary)',
              }}
              aria-pressed={isLiked}
              aria-label={isLiked ? `Hủy thích (${likesCount})` : `Thích (${likesCount})`}
            >
              <Heart
                className={isLiked ? 'fill-current' : ''}
                size="20"
                strokeWidth={2}
                aria-hidden="true"
                style={{ color: isLiked ? 'var(--color-gold-600)' : 'var(--color-text-secondary)' }}
              />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button
              onClick={onComment}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] transition-colors touch-target"
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-secondary)',
              }}
              aria-label={`Bình luận (${commentsCount})`}
            >
              <MessageSquare size="20" strokeWidth={2} aria-hidden="true" style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-sm font-medium">{commentsCount}</span>
            </button>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)] transition-colors touch-target"
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-secondary)',
            }}
            aria-label="Chia sẻ"
          >
            <Share2 size="20" strokeWidth={2} aria-hidden="true" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>
      </div>
    </article>
  );
}