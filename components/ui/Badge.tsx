// Badge Component - Material Design 3 compliant with PSN Health 9-state colors
'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold' | 'psn';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  children: ReactNode;
  psnRank?: 'tan-binh' | 'truong-binh' | 'chien-binh' | 'chi-huy' | 'tuong-quan' | 'tuong-lenh' | 'than-binh' | 'cao-thuong';
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[var(--text-xs)] gap-1',
  md: 'px-2.5 py-1 text-[var(--text-sm)] gap-1.5',
  lg: 'px-3 py-1.5 text-[var(--text-base)] gap-2',
};

const variantClasses = {
  default: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/30',
  warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/30',
  error: 'bg-[var(--color-error-soft)] text-[var(--color-error)] border border-[var(--color-error)]/30',
  info: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info)]/30',
  gold: 'bg-[var(--color-gold-500)]/15 text-[var(--color-gold-700)] border border-[var(--color-gold-500)]/30',
  psn: '', // Handled separately
};

const psnRankColors = {
  'tan-binh': { bg: '#60A5FA15', text: '#60A5FA', border: '#60A5FA30' },
  'truong-binh': { bg: '#A78BFA15', text: '#A78BFA', border: '#A78BFA30' },
  'chien-binh': { bg: '#34D39915', text: '#34D399', border: '#34D39930' },
  'chi-huy': { bg: '#FBBF2415', text: '#FBBF24', border: '#FBBF2430' },
  'tuong-quan': { bg: '#FFD70015', text: '#C9A200', border: '#FFD70030' },
  'tuong-lenh': { bg: '#F472B615', text: '#F472B6', border: '#F472B630' },
  'than-binh': { bg: '#E5E7EB15', text: '#9CA3AF', border: '#E5E7EB30' },
  'cao-thuong': { bg: '#FFC10715', text: '#A68400', border: '#FFC10730' },
};

const psnRankLabels: Record<BadgeProps['psnRank'], string> = {
  'tan-binh': 'Tân binh',
  'truong-binh': 'Trung binh',
  'chien-binh': 'Chiến binh',
  'chi-huy': 'Chỉ huy',
  'tuong-quan': 'Tướng quân',
  'tuong-lenh': 'Tướng lệnh',
  'than-binh': 'Thần binh',
  'cao-thuong': 'Cao thưởng',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      removable = false,
      onRemove,
      children,
      psnRank,
      className,
      ...props
    },
    ref
  ) => {
    const isPsn = variant === 'psn' || !!psnRank;
    const rank = psnRank || 'tan-binh';
    const colors = psnRankColors[rank];

    const content = (
      <span className="flex items-center gap-1.5">
        {dot && !isPsn && (
          <span
            className={cn(
              'rounded-full flex-shrink-0',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2 h-2',
              size === 'lg' && 'w-2.5 h-2.5',
              variant === 'success' && 'bg-[var(--color-success)]',
              variant === 'warning' && 'bg-[var(--color-warning)]',
              variant === 'error' && 'bg-[var(--color-error)]',
              variant === 'info' && 'bg-[var(--color-info)]',
              variant === 'gold' && 'bg-[var(--color-gold-500)]',
              variant === 'default' && 'bg-[var(--color-text-tertiary)]',
              isPsn && colors.text && `bg-[${colors.text}]`
            )}
            aria-hidden="true"
          />
        )}
        {dot && isPsn && (
          <span
            className={cn(
              'rounded-full flex-shrink-0',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2 h-2',
              size === 'lg' && 'w-2.5 h-2.5',
              colors.text && `bg-[${colors.text}]`
            )}
            aria-hidden="true"
          />
        )}
        <span>{children || (isPsn && psnRankLabels[rank])}</span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'flex-shrink-0 rounded-full p-0.5 leading-none',
              'hover:bg-black/10 hover:text-[var(--color-text-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]',
              'transition-colors duration-[var(--duration-fast)]',
              size === 'sm' && 'text-[10px]',
              size === 'md' && 'text-[12px]',
              size === 'lg' && 'text-[14px]'
            )}
            aria-label="Remove"
          >
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium',
          'rounded-[var(--radius-full)]',
          'border',
          'transition-all duration-[var(--duration-fast)] easing-[var(--easing-enter)]',
          sizeClasses[size],
          isPsn
            ? `bg-[${colors.bg}] text-[${colors.text}] border-[${colors.border}]`
            : variantClasses[variant],
          removable && 'pr-1',
          className
        )}
        {...props}
      >
        {content}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Badge Group for multiple badges
export interface BadgeGroupProps extends HTMLAttributes<HTMLDivElement> {
  badges: Array<{
    label: string;
    variant?: BadgeProps['variant'];
    psnRank?: BadgeProps['psnRank'];
    onClick?: () => void;
  }>;
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
}

export function BadgeGroup({ badges, size = 'md', maxVisible = 3, className, ...props }: BadgeGroupProps) {
  const visibleBadges = badges.slice(0, maxVisible);
  const remaining = badges.length - maxVisible;

  return (
    <div
      className={cn('inline-flex flex-wrap gap-1.5', className)}
      {...props}
    >
      {visibleBadges.map((badge, index) => (
        <Badge
          key={index}
          size={size}
          variant={badge.variant}
          psnRank={badge.psnRank}
          onClick={badge.onClick}
          className={badge.onClick ? 'cursor-pointer' : ''}
        >
          {badge.label}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge size={size} variant="default">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}

// Status Badge - specifically for status indicators
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'psnRank' | 'dot'> {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error' | 'processing' | 'completed' | 'cancelled';
  showDot?: boolean;
}

const statusConfig: Record<StatusBadgeProps['status'], { label: string; variant: BadgeProps['variant']; dot: boolean }> = {
  active: { label: 'Hoạt động', variant: 'success', dot: true },
  inactive: { label: 'Không hoạt động', variant: 'default', dot: true },
  pending: { label: 'Đang chờ', variant: 'warning', dot: true },
  success: { label: 'Thành công', variant: 'success', dot: true },
  warning: { label: 'Cảnh báo', variant: 'warning', dot: true },
  error: { label: 'Lỗi', variant: 'error', dot: true },
  processing: { label: 'Đang xử lý', variant: 'info', dot: true },
  completed: { label: 'Hoàn thành', variant: 'success', dot: true },
  cancelled: { label: 'Đã hủy', variant: 'error', dot: true },
};

export function StatusBadge({ status, showDot = true, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      dot={showDot}
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
}

// PSN Rank Badge - specialized for PSN Health 9-state system
export interface PSNRankBadgeProps extends Omit<BadgeProps, 'variant' | 'psnRank' | 'children'> {
  rank: 'tan-binh' | 'truong-binh' | 'chien-binh' | 'chi-huy' | 'tuong-quan' | 'tuong-lenh' | 'than-binh' | 'cao-thuong';
  showIcon?: boolean;
}

const psnRankIcons: Record<PSNRankBadgeProps['rank'], ReactNode> = {
  'tan-binh': <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
  'truong-binh': <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
  'chien-binh': <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
  'chi-huy': <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
  'tuong-quan': <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
  'tuong-lenh': <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
  'than-binh': <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
  'cao-thuong': <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>,
};

export function PSNRankBadge({ rank, showIcon = true, size = 'md', className, ...props }: PSNRankBadgeProps) {
  return (
    <Badge
      variant="psn"
      psnRank={rank}
      size={size}
      className={cn('gap-1.5', className)}
      {...props}
    >
      {showIcon && <span className="flex-shrink-0" aria-hidden="true">{psnRankIcons[rank]}</span>}
      {psnRankLabels[rank]}
    </Badge>
  );
}