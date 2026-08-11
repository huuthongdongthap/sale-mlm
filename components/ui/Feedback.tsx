// Utility Components - FocusLock, Portal, Tooltip, Skeleton
'use client';

import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// ============================================================================
// FOCUS LOCK
// ============================================================================

interface FocusLockProps {
  children: ReactNode;
  enabled?: boolean;
  autoFocus?: boolean;
  returnFocus?: boolean;
  onDeactivate?: () => void;
}

export function FocusLock({ children, enabled = true, autoFocus = true, returnFocus = true, onDeactivate }: FocusLockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Save the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (autoFocus && firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      onDeactivate?.();
    };
  }, [enabled, autoFocus, returnFocus, onDeactivate]);

  return <div ref={containerRef} className="focus-lock">{children}</div>;
}

// ============================================================================
// PORTAL
// ============================================================================

interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
  className?: string;
}

export function Portal({ children, container, className }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const targetContainer = container || portalContainerRef.current || document.body;

  // Create portal container if it doesn't exist and we're using body
  if (!container && !portalContainerRef.current) {
    const div = document.createElement('div');
    div.id = 'portal-root';
    div.className = className || '';
    document.body.appendChild(div);
    portalContainerRef.current = div;
  }

  return createPortal(children, targetContainer);
}

// ============================================================================
// TOOLTIP
// ============================================================================

interface TooltipProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  delay?: number;
  children: ReactNode;
  className?: string;
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-bg-elevated)]',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-bg-elevated)]',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-bg-elevated)]',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-bg-elevated)]',
};

export function Tooltip({ content, position = 'top', offset = 8, open, defaultOpen = false, delay = 200, children, className }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const controlled = open !== undefined;
  const currentOpen = controlled ? open : isOpen;

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
    setTimeout(() => setIsVisible(false), 150);
  }, []);

  const handleMouseEnter = () => show();
  const handleMouseLeave = () => hide();
  const handleFocus = () => show();
  const handleBlur = () => hide();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const child = React.Children.only(children) as React.ReactElement;
  const childProps = child.props as Record<string, unknown>;

  const mergedProps = {
    ...childProps,
    ref: triggerRef,
    onMouseEnter: () => { childProps.onMouseEnter?.(); handleMouseEnter(); },
    onMouseLeave: () => { childProps.onMouseLeave?.(); handleMouseLeave(); },
    onFocus: () => { childProps.onFocus?.(); handleFocus(); },
    onBlur: () => { childProps.onBlur?.(); handleBlur(); },
    'aria-describedby': currentOpen ? 'tooltip-content' : undefined,
  };

  return (
    <>
      {React.cloneElement(child, mergedProps)}
      {currentOpen && isVisible && (
        <Portal>
          <div
            id="tooltip-content"
            role="tooltip"
            className={cn(
              'fixed z-[var(--z-tooltip)]',
              'px-3 py-1.5',
              'bg-[var(--color-bg-elevated)]',
              'text-[var(--text-sm)] text-[var(--color-text-primary)]',
              'rounded-[var(--radius-md)]',
              'shadow-[var(--shadow-lg)]',
              'border border-[var(--color-border-default)]',
              'whitespace-nowrap',
              'animate-fadeIn',
              positionClasses[position],
              className
            )}
            style={{
              transform: position === 'top' || position === 'bottom'
                ? `translateX(-50%) translateY(${position === 'top' ? -offset : offset}px)`
                : `translateY(-50%) translateX(${position === 'left' ? -offset : offset}px)`,
            }}
          >
            {content}
            <div
              className={cn(
                'absolute w-0 h-0 border-4 border-transparent',
                arrowClasses[position]
              )}
              aria-hidden="true"
            />
          </div>
        </Portal>
      )}
    </>
  );
}

// ============================================================================
// POPOVER
// ============================================================================

interface PopoverProps {
  content: ReactNode;
  trigger?: 'click' | 'hover' | 'focus';
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  children: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ content, trigger = 'click', position = 'bottom', offset = 8, children, className, onOpenChange }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const open = () => {
    setIsOpen(true);
    onOpenChange?.(true);
  };

  const close = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const toggle = () => (isOpen ? close() : open());

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        triggerRef.current?.contains(event.target as Node) ||
        contentRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      close();
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClickOutside]);

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close();
  };

  const child = React.Children.only(children) as React.ReactElement;
  const childProps = child.props as Record<string, unknown>;

  const mergedProps = {
    ...childProps,
    ref: triggerRef,
    onClick: trigger === 'click' ? () => { childProps.onClick?.(); toggle(); } : childProps.onClick,
    onMouseEnter: trigger === 'hover' ? () => { childProps.onMouseEnter?.(); open(); } : childProps.onMouseEnter,
    onMouseLeave: trigger === 'hover' ? () => { childProps.onMouseLeave?.(); close(); } : childProps.onMouseLeave,
    onFocus: trigger === 'focus' ? () => { childProps.onFocus?.(); open(); } : childProps.onFocus,
    onBlur: trigger === 'focus' ? () => { childProps.onBlur?.(); close(); } : childProps.onBlur,
    'aria-expanded': isOpen,
    'aria-haspopup': true,
  };

  return (
    <>
      {React.cloneElement(child, mergedProps)}
      {isOpen && (
        <Portal>
          <div
            ref={contentRef}
            role="dialog"
            className={cn(
              'fixed z-[var(--z-overlay)]',
              'bg-[var(--color-bg-card)]',
              'border border-[var(--color-border-default)]',
              'rounded-[var(--radius-xl)]',
              'shadow-[var(--shadow-lg)]',
              'p-4',
              'min-w-[240px]',
              'max-w-[360px]',
              'animate-slideUp',
              className
            )}
            style={{
              transform: position === 'top' || position === 'bottom'
                ? `translateX(-50%) translateY(${position === 'top' ? -offset : offset}px)`
                : `translateY(-50%) translateX(${position === 'left' ? -offset : offset}px)`,
            }}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width = '100%', height, animation = 'pulse', className, ...props }, ref) => {
    const baseStyles = {
      text: 'h-4 rounded-[var(--radius-sm)]',
      circular: 'rounded-full',
      rectangular: 'rounded-[var(--radius-md)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-[var(--color-border-default)]',
          'overflow-hidden',
          baseStyles[variant],
          animation === 'pulse' && 'animate-pulse',
          animation === 'wave' && 'animate-wave',
          className
        )}
        style={{
          width,
          height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '1rem' : '100%'),
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// ============================================================================
// DIVIDER
// ============================================================================

interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  children?: ReactNode;
  inset?: boolean;
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = 'horizontal', variant = 'solid', children, inset = false, className, ...props }, ref) => {
    return (
      <div className={cn('flex items-center gap-3', className)} role="separator" {...props}>
        <hr
          ref={ref}
          className={cn(
            'flex-1 border-0',
            orientation === 'horizontal' ? 'w-full' : 'h-full',
            variant === 'solid' && 'bg-[var(--color-border-default)]',
            variant === 'dashed' && 'bg-[var(--color-border-default)] border-t-[1px] border-dashed',
            variant === 'dotted' && 'bg-[var(--color-border-default)] border-t-[1px] border-dotted',
            inset && 'mx-4',
            orientation === 'vertical' && 'w-px h-8'
          )}
          aria-orientation={orientation}
        />
        {children && (
          <span className="flex-shrink-0 text-[var(--text-sm)] text-[var(--color-text-tertiary)] px-2">
            {children}
          </span>
        )}
        <hr
          className={cn(
            'flex-1 border-0',
            orientation === 'horizontal' ? 'w-full' : 'h-full',
            variant === 'solid' && 'bg-[var(--color-border-default)]',
            variant === 'dashed' && 'bg-[var(--color-border-default)] border-t-[1px] border-dashed',
            variant === 'dotted' && 'bg-[var(--color-border-default)] border-t-[1px] border-dotted',
            inset && 'mx-4',
            orientation === 'vertical' && 'w-px h-8'
          )}
          aria-hidden="true"
        />
      </div>
    );
  }
);

Divider.displayName = 'Divider';

// ============================================================================
// SPINNER
// ============================================================================

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'gold' | 'inherit';
}

const sizeClasses = {
  sm: 'w-4 h-4 border-[2px]',
  md: 'w-6 h-6 border-[3px]',
  lg: 'w-8 h-8 border-[3px]',
};

export function Spinner({ size = 'md', color = 'primary', className, ...props }: SpinnerProps) {
  const colorStyles = {
    primary: 'border-[var(--color-gold-500)]/30 border-t-[var(--color-gold-500)]',
    gold: 'border-[var(--color-gold-500)]/30 border-t-[var(--color-gold-500)]',
    inherit: 'border-current/30 border-t-current',
  };

  return (
    <div
      className={cn(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        colorStyles[color],
        className
      )}
      role="status"
      aria-label="Đang tải"
      {...props}
    >
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}