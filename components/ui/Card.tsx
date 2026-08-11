// Card Component - Material Design 3 compliant
'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled' | 'gold';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variantClasses = {
  elevated: 'bg-[var(--color-bg-card)] shadow-[var(--shadow-md)] border-0',
  outlined: 'bg-[var(--color-bg-card)] border border-[var(--color-border-default)] shadow-none',
  filled: 'bg-[var(--color-bg-elevated)] border-0 shadow-none',
  gold: 'bg-[var(--color-bg-card)] border border-[var(--color-gold-500)]/30 shadow-[var(--shadow-gold-sm)]',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', padding = 'md', hoverable = false, clickable = false, onClick, className, children, ...props }, ref) => {
    const handleClick = clickable ? onClick : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-xl)]',
          'transition-all duration-[var(--duration-normal)] easing-[var(--easing-enter)]',
          paddingClasses[padding],
          variantClasses[variant],
          hoverable && 'hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5',
          clickable && 'cursor-pointer active:scale-[0.99] active:shadow-[var(--shadow-sm)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',
          className
        )}
        onClick={handleClick}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }} : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

// Card Title
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', className, children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]',
        'tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
);

CardTitle.displayName = 'CardTitle';

// Card Description
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-[var(--text-sm)] text-[var(--color-text-tertiary)] mt-1',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

// Card Content
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

// Card Footer
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-[var(--color-border-subtle)] flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

// Card Media (Image/Video)
export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '21/9' | 'auto';
  fit?: 'cover' | 'contain' | 'fill';
}

export const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(
  ({ src, alt = '', aspectRatio = '16/9', fit = 'cover', className, ...props }, ref) => {
    const aspectRatioStyles = {
      '16/9': 'aspect-video',
      '4/3': 'aspect-[4/3]',
      '1/1': 'aspect-square',
      '21/9': 'aspect-[21/9]',
      'auto': '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-t-[var(--radius-xl)]',
          aspectRatioStyles[aspectRatio],
          className
        )}
        {...props}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-center transition-transform duration-500',
            fit === 'cover' && 'object-cover',
            fit === 'contain' && 'object-contain',
            fit === 'fill' && 'object-fill'
          )}
          loading="lazy"
        />
      </div>
    );
  }
);

CardMedia.displayName = 'CardMedia';

// Card Actions (for footer with buttons)
export interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(
  ({ children, align = 'end', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-border-subtle)]',
        align === 'start' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'end' && 'justify-end',
        align === 'stretch' && 'justify-stretch',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

CardActions.displayName = 'CardActions';