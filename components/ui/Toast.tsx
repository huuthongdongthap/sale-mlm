// Toast Component - Material Design 3 compliant
'use client';

import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Portal } from '@/components/ui/Portal';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gold';
  title: string;
  description?: string;
  duration?: number; // ms, 0 = no auto-dismiss
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
}

const variantClasses = {
  success: 'border-l-4 border-[var(--color-success)] bg-[var(--color-success-soft)]',
  warning: 'border-l-4 border-[var(--color-warning)] bg-[var(--color-warning-soft)]',
  error: 'border-l-4 border-[var(--color-error)] bg-[var(--color-error-soft)]',
  info: 'border-l-4 border-[var(--color-info)] bg-[var(--color-info-soft)]',
  gold: 'border-l-4 border-[var(--color-gold-500)] bg-[var(--color-gold-500)]/10',
};

const variantIcons = {
  success: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  warning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  gold: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  ),
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      variant = 'info',
      title,
      description,
      duration = 5000,
      action,
      onClose,
      className,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          onClose?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    if (!visible) return null;

    return (
      <Portal>
        <div
          ref={ref}
          className={cn(
            'flex items-start gap-3 p-4',
            'rounded-[var(--radius-lg)]',
            'shadow-[var(--shadow-lg)]',
            'border border-[var(--color-border-subtle)]',
            'animate-slideUp',
            'min-w-[300px] max-w-md',
            variantClasses[variant],
            className
          )}
          role="alert"
          aria-live="polite"
          {...props}
        >
          <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
            {variantIcons[variant]}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[var(--text-sm)] text-[var(--color-text-primary)]">
              {title}
            </h4>
            {description && (
              <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                {description}
              </p>
            )}
            {action && (
              <div className="mt-3">
                <Button size="sm" variant="text" onClick={() => { action.onClick(); setVisible(false); onClose?.(); }}>
                  {action.label}
                </Button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setVisible(false); onClose?.(); }}
            className={cn(
              'flex-shrink-0 p-1',
              'text-[var(--color-text-tertiary)]',
              'hover:text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-bg-hover)]',
              'rounded-[var(--radius-full)]',
              'transition-colors duration-[var(--duration-fast)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]'
            )}
            aria-label="Đóng thông báo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Portal>
    );
  }
);

Toast.displayName = 'Toast';

// ============================================================================
// TOAST CONTAINER & HOOK
// ============================================================================

import { createContext, useContext, useMemo, ReactNode } from 'react';

interface ToastContextValue {
  toasts: Array<ToastProps & { id: string }>;
  addToast: (toast: ToastProps) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = useCallback((toast: ToastProps) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = useMemo(() => ({ toasts, addToast, removeToast, clearToasts }), [toasts, addToast, removeToast, clearToasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Array<ToastProps & { id: string }>; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[var(--z-toast)] flex flex-col gap-3 w-[360px] max-w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Convenience functions
export const toast = {
  success: (title: string, description?: string, options?: Partial<ToastProps>) =>
    ({ variant: 'success', title, description, ...options } as ToastProps),
  warning: (title: string, description?: string, options?: Partial<ToastProps>) =>
    ({ variant: 'warning', title, description, ...options } as ToastProps),
  error: (title: string, description?: string, options?: Partial<ToastProps>) =>
    ({ variant: 'error', title, description, ...options } as ToastProps),
  info: (title: string, description?: string, options?: Partial<ToastProps>) =>
    ({ variant: 'info', title, description, ...options } as ToastProps),
  gold: (title: string, description?: string, options?: Partial<ToastProps>) =>
    ({ variant: 'gold', title, description, ...options } as ToastProps),
};