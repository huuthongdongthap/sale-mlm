// Avatar Component - Material Design 3 compliant
'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'away' | 'offline' | 'busy';
  statusPosition?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[var(--text-xs)]',
  sm: 'w-8 h-8 text-[var(--text-sm)]',
  md: 'w-10 h-10 text-[var(--text-base)]',
  lg: 'w-12 h-12 text-[var(--text-lg)]',
  xl: 'w-16 h-16 text-[var(--text-xl)]',
  '2xl': 'w-24 h-24 text-[var(--text-2xl)]',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

const statusPositionClasses = {
  'bottom-right': 'bottom-0 right-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'top-left': 'top-0 left-0',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', shape = 'circle', status, statusPosition = 'bottom-right', className, ...props }, ref) => {
    const initials = name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const hasImage = src && !src.includes('placeholder');

    const getColorFromName = (name: string): string => {
      const colors = [
        'bg-[var(--color-gold-500)]/20 text-[var(--color-gold-700)]',
        'bg-[var(--color-success)]/20 text-[var(--color-success)]',
        'bg-[var(--color-info)]/20 text-[var(--color-info)]',
        'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
        'bg-[var(--color-error)]/20 text-[var(--color-error)]',
        'bg-[var(--color-psn-chi-huy)]/20 text-[var(--color-psn-chi-huy)]',
        'bg-[var(--color-psn-tuong-quan)]/20 text-[var(--color-psn-tuong-quan)]',
        'bg-[var(--color-psn-tuong-lenh)]/20 text-[var(--color-psn-tuong-lenh)]',
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    const bgColor = name ? getColorFromName(name) : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]';

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'overflow-hidden',
          'flex-shrink-0',
          shape === 'circle' ? 'rounded-full' : 'rounded-[var(--radius-lg)]',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className={cn('font-medium', bgColor)} aria-hidden="true">
            {initials || '?'}
          </span>
        )}

        {status && (
          <span
            className={cn(
              'absolute border-2 border-[var(--color-bg-base)]',
              'rounded-full',
              statusSizeClasses[size],
              statusPositionClasses[statusPosition],
              status === 'online' && 'bg-[var(--color-success)]',
              status === 'away' && 'bg-[var(--color-warning)]',
              status === 'busy' && 'bg-[var(--color-error)]',
              status === 'offline' && 'bg-[var(--color-text-disabled)]'
            )}
            aria-label={`Trạng thái: ${status === 'online' ? 'Trực tuyến' : status === 'away' ? 'Vắng mặt' : status === 'busy' ? 'Bận' : 'Ngoại tuyến'}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// ============================================================================
// AVATAR GROUP
// ============================================================================

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  avatars: Array<AvatarProps & { id?: string }>;
  max?: number;
  size?: AvatarProps['size'];
  overlap?: boolean;
  className?: string;
}

export function AvatarGroup({ avatars, max = 5, size = 'md', overlap = true, className }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div
      className={cn(
        'inline-flex',
        overlap ? '-space-x-2' : 'space-x-2',
        className
      )}
      role="group"
      aria-label={`${avatars.length} người dùng`}
    >
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          {...avatar}
          size={size}
          className={cn(
            'ring-2 ring-[var(--color-bg-base)]',
            'transition-transform duration-[var(--duration-fast)]',
            'hover:z-10 hover:scale-110',
            index > 0 && overlap && '-ml-2'
          )}
        />
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            'inline-flex items-center justify-center',
            'border-2 border-[var(--color-bg-base)]',
            'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]',
            'font-medium',
            shape === 'circle' ? 'rounded-full' : 'rounded-[var(--radius-lg)]',
            sizeClasses[size],
            'ring-2 ring-[var(--color-bg-base)]',
            'cursor-pointer hover:bg-[var(--color-bg-hover)]',
            index > 0 && overlap && '-ml-2'
          )}
          aria-label={`Và ${remainingCount} người khác`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// USER AVATAR WITH NAME TOOLTIP
// ============================================================================

import { Tooltip } from './Tooltip';

export interface UserAvatarProps extends Omit<AvatarProps, 'name'> {
  name: string;
  role?: string;
  showTooltip?: boolean;
}

export function UserAvatar({ name, role, showTooltip = true, ...props }: UserAvatarProps) {
  const avatar = <Avatar name={name} {...props} />;

  if (!showTooltip || !role) return avatar;

  return (
    <Tooltip content={(
      <div className="text-left">
        <p className="font-medium text-[var(--text-sm)]">{name}</p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">{role}</p>
      </div>
    )} position="top">
      {avatar}
    </Tooltip>
  );
}