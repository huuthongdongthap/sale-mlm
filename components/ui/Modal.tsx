// Modal & Dialog Components - Material Design 3 compliant
'use client';

import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { FocusLock } from '@/components/ui/FocusLock';
import { Portal } from '@/components/ui/Portal';

// ============================================================================
// MODAL
// ============================================================================

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      footer,
      children,
      className,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`);
    const descriptionId = useRef(`modal-description-${Math.random().toString(36).slice(2, 9)}`);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape) {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    const handleOverlayClick = useCallback(
      (event: React.MouseEvent) => {
        if (event.target === event.currentTarget && closeOnOverlayClick) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    useEffect(() => {
      if (open) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
        previousActiveElement.current?.focus();
      }
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return (
      <Portal>
        <div
          className={cn(
            'fixed inset-0 z-[var(--z-modal)]',
            'flex items-center justify-center p-4',
            'animate-fadeIn'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId.current : ariaLabelledBy}
          aria-describedby={description ? descriptionId.current : ariaDescribedBy}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <FocusLock>
            <div
              ref={ref}
              className={cn(
                'relative w-full',
                'bg-[var(--color-bg-card)]',
                'rounded-[var(--radius-xl)]',
                'shadow-[var(--shadow-lg)]',
                'animate-slideUp',
                'overflow-hidden',
                sizeClasses[size],
                className
              )}
              {...props}
            >
              {(title || footer) && (
                <div className="flex items-start justify-between p-6 border-b border-[var(--color-border-subtle)]">
                  <div>
                    {title && (
                      <h2
                        id={titleId.current}
                        className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id={descriptionId.current}
                        className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      'p-1.5 rounded-[var(--radius-full)]',
                      'text-[var(--color-text-tertiary)]',
                      'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]',
                      'transition-colors duration-[var(--duration-fast)]'
                    )}
                    aria-label="Đóng"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className={cn('p-6', !title && !footer && 'pt-6')}>
                {children}
              </div>

              {footer && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/50">
                  {footer}
                </div>
              )}
            </div>
          </FocusLock>
        </div>
      </Portal>
    );
  }
);

Modal.displayName = 'Modal';

// ============================================================================
// DIALOG (Confirmation Modal)
// ============================================================================

export interface DialogProps extends Omit<ModalProps, 'footer' | 'children'> {
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
  children: ReactNode;
}

export function Dialog({
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'default',
  onConfirm,
  loading = false,
  children,
  ...props
}: DialogProps) {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      {...props}
      footer={
        <>
          <Button variant="text" onClick={props.onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'error' : 'filled'}
            onClick={handleConfirm}
            disabled={loading}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

// ============================================================================
// DRAWER (Side Sheet)
// ============================================================================

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  title?: string;
  description?: string;
  children: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const drawerPositionClasses = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
  top: 'top-0 left-0 w-full',
  bottom: 'bottom-0 left-0 w-full',
};

const drawerSizeClasses = {
  sm: 'w-72',
  md: 'w-96',
  lg: 'w-[448px]',
  full: 'w-full max-w-2xl',
};

const drawerTopSizeClasses = {
  sm: 'h-48',
  md: 'h-64',
  lg: 'h-96',
  full: 'h-full max-h-[80vh]',
};

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      position = 'right',
      size = 'md',
      title,
      description,
      children,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      className,
      ...props
    },
    ref
  ) => {
    const titleId = useRef(`drawer-title-${Math.random().toString(36).slice(2, 9)}`);
    const descriptionId = useRef(`drawer-description-${Math.random().toString(36).slice(2, 9)}`);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape) {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    const handleOverlayClick = useCallback(
      (event: React.MouseEvent) => {
        if (event.target === event.currentTarget && closeOnOverlayClick) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      }
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [open, handleKeyDown]);

    if (!open) return null;

    const isVertical = position === 'left' || position === 'right';
    const isHorizontal = position === 'top' || position === 'bottom';

    return (
      <Portal>
        <div
          className={cn(
            'fixed z-[var(--z-modal)]',
            'flex',
            isVertical ? 'items-stretch' : 'items-center justify-center',
            'inset-0 p-4',
            'animate-fadeIn'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId.current : undefined}
          aria-describedby={description ? descriptionId.current : undefined}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn flex-1"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <FocusLock>
            <div
              ref={ref}
              className={cn(
                'relative',
                'bg-[var(--color-bg-card)]',
                'shadow-[var(--shadow-lg)]',
                'animate-slideUp',
                'overflow-hidden flex flex-col',
                drawerPositionClasses[position],
                isVertical ? drawerSizeClasses[size] : drawerTopSizeClasses[size],
                isHorizontal ? 'rounded-[var(--radius-xl)]' : 'rounded-t-[var(--radius-xl)]',
                className
              )}
              {...props}
            >
              {(title || description) && (
                <div className="flex items-start justify-between p-6 border-b border-[var(--color-border-subtle)] flex-shrink-0">
                  <div>
                    {title && (
                      <h2
                        id={titleId.current}
                        className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id={descriptionId.current}
                        className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      'p-1.5 rounded-[var(--radius-full)]',
                      'text-[var(--color-text-tertiary)]',
                      'hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]',
                      'transition-colors duration-[var(--duration-fast)]'
                    )}
                    aria-label="Đóng"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>
            </div>
          </FocusLock>
        </div>
      </Portal>
    );
  }
);

Drawer.displayName = 'Drawer';

// ============================================================================
// ALERT DIALOG (Simple Alert)
// ============================================================================

export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm?: () => void;
}

export function AlertDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'OK',
  variant = 'default',
  onConfirm,
}: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      variant={variant}
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      cancelLabel="Hủy"
    >
      {description && (
        <p className="text-[var(--text-base)] text-[var(--color-text-secondary)]">
          {description}
        </p>
      )}
    </Dialog>
  );
}