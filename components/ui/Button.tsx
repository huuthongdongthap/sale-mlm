// Button Component - Material Design 3 compliant
'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'tonal' | 'text' | 'elevated' | 'gold' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

const sizeClasses = {
  xs: 'px-2.5 py-1 text-xs gap-1.5',
  sm: 'px-3 py-1.5 text-sm gap-2',
  md: 'px-4 py-2 text-base gap-2.5',
  lg: 'px-5 py-2.5 text-md gap-3',
  xl: 'px-6 py-3 text-lg gap-3',
};

const variantClasses = {
  filled: 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:bg-[var(--md-sys-color-primary)]/90 active:bg-[var(--md-sys-color-primary)]/100 focus:ring-[var(--md-sys-color-primary)]',
  outlined: 'border border-[var(--md-sys-color-outline)] bg-transparent text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/8 active:bg-[var(--md-sys-color-primary)]/12 focus:ring-[var(--md-sys-color-primary)]',
  tonal: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:bg-[var(--md-sys-color-secondary-container)]/80 active:bg-[var(--md-sys-color-secondary-container)]/100 focus:ring-[var(--md-sys-color-secondary)]',
  text: 'bg-transparent text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/8 active:bg-[var(--md-sys-color-primary)]/12 focus:ring-[var(--md-sys-color-primary)]',
  elevated: 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-primary)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] active:shadow-[var(--shadow-sm)] focus:ring-[var(--md-sys-color-primary)]',
  gold: 'bg-[var(--color-gold-500)] text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-600)] active:bg-[var(--color-gold-700)] focus:ring-[var(--color-gold-500)] shadow-[var(--shadow-gold-sm)] hover:shadow-[var(--shadow-gold-lg)]',
  gradient: 'bg-gradient-to-r from-[var(--color-gold-500)] to-[var(--color-gold-400)] text-[var(--color-text-on-gold)] hover:from-[var(--color-gold-600)] hover:to-[var(--color-gold-500)] active:from-[var(--color-gold-700)] active:to-[var(--color-gold-600)] focus:ring-[var(--color-gold-500)] shadow-[var(--shadow-gold-sm)] hover:shadow-[var(--shadow-gold-lg)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'filled',
      size = 'md',
      leadingIcon,
      trailingIcon,
      fullWidth = false,
      loading = false,
      disabled,
      className,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)]',
          'transition-all duration-[var(--duration-fast)] easing-[var(--easing-enter)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.98]',
          'touch-target-min',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leadingIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">{leadingIcon}</span>
        ) : null}
        <span className={cn('truncate', loading && 'opacity-0')}>{children}</span>
        {!loading && trailingIcon && (
          <span className="flex-shrink-0" aria-hidden="true">{trailingIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button Variant
export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'fullWidth' | 'children'> {
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
  children: ReactNode;
}

const iconButtonSizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'text', size = 'md', 'aria-label': ariaLabel, children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size as ButtonProps['size']}
        className={cn(
          iconButtonSizeClasses[size],
          'rounded-[var(--radius-full)]',
          className
        )}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// FAB (Floating Action Button)
export interface FABProps extends Omit<ButtonProps, 'size' | 'fullWidth'> {
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const fabPositionClasses = {
  'bottom-right': 'fixed bottom-6 right-6',
  'bottom-left': 'fixed bottom-6 left-6',
  'top-right': 'fixed top-6 right-6',
  'top-left': 'fixed top-6 left-6',
};

const fabSizeClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export const FAB = forwardRef<HTMLButtonElement, FABProps>(
  ({ variant = 'filled', size = 'md', position = 'bottom-right', className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          fabPositionClasses[position],
          fabSizeClasses[size],
          'rounded-[var(--radius-full)] shadow-[var(--shadow-lg)]',
          'z-[var(--z-sticky)]',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

FAB.displayName = 'FAB';

// Button Group
export interface ButtonGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
}

export function ButtonGroup({ children, orientation = 'horizontal', variant, size, className }: ButtonGroupProps) {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'rounded-[var(--radius-lg)] overflow-hidden' : 'flex-col rounded-[var(--radius-lg)] overflow-hidden',
        'border border-[var(--color-border-default)]',
        className
      )}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child as React.ReactElement<ButtonProps>, {
          variant: child.props.variant ?? variant,
          size: child.props.size ?? size,
          className: cn(
            child.props.className,
            orientation === 'horizontal'
              ? index === 0
                ? 'rounded-r-none'
                : index === React.Children.count(children) - 1
                ? 'rounded-l-none'
                : 'rounded-none'
              : index === 0
              ? 'rounded-b-none'
              : index === React.Children.count(children) - 1
              ? 'rounded-t-none'
              : 'rounded-none',
            'border-0'
          ),
        });
      })}
    </div>
  );
}

// Segmented Button
export interface SegmentedButtonProps {
  options: Array<{ value: string; label: string; icon?: ReactNode; disabled?: boolean }>;
  value: string;
  onChange: (value: string) => void;
  variant?: 'single' | 'multiple';
  className?: string;
}

export function SegmentedButton({ options, value, onChange, variant = 'single', className }: SegmentedButtonProps) {
  const selectedValues = variant === 'multiple' ? value.split(',') : [value];

  return (
    <div
      className={cn(
        'inline-flex rounded-[var(--radius-lg)] bg-[var(--color-bg-card)] border border-[var(--color-border-default)] p-1',
        className
      )}
      role="group"
      aria-label="Segmented button group"
    >
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (variant === 'multiple') {
                const newValues = isSelected
                  ? selectedValues.filter((v) => v !== option.value)
                  : [...selectedValues, option.value];
                onChange(newValues.join(','));
              } else {
                onChange(option.value);
              }
            }}
            disabled={option.disabled}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-[var(--radius-md)]',
              'transition-all duration-[var(--duration-fast)] easing-[var(--easing-enter)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isSelected
                ? 'bg-[var(--color-gold-500)] text-[var(--color-text-on-gold)] shadow-[var(--shadow-gold-sm)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]',
              index > 0 && 'ml-1'
            )}
            aria-pressed={isSelected}
            aria-disabled={option.disabled}
          >
            {option.icon && <span className="flex-shrink-0" aria-hidden="true">{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}