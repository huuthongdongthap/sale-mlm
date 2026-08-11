// Input Components - Material Design 3 compliant
'use client';

import { forwardRef, type HTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// LABEL
// ============================================================================

export interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, optional, children, className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-[var(--text-sm)] font-medium text-[var(--color-text-primary)] mb-1.5',
        'transition-colors duration-[var(--duration-fast)]',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-[var(--color-error)] ml-0.5" aria-hidden="true">*</span>}
      {optional && <span className="text-[var(--color-text-tertiary)] ml-1">(Tùy chọn)</span>}
    </label>
  )
);

Label.displayName = 'Label';

// ============================================================================
// INPUT
// ============================================================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  leadingAdjunct?: React.ReactNode;
  trailingAdjunct?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder,
      helperText,
      error,
      leadingIcon,
      trailingIcon,
      leadingAdjunct,
      trailingAdjunct,
      fullWidth = true,
      disabled = false,
      required,
      optional,
      className,
      id,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const helperId = helperText || error ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('w-full max-w-full', fullWidth && 'w-full')}>
        {label && (
          <Label htmlFor={inputId} required={required} optional={optional}>
            {label}
          </Label>
        )}
        <div className="relative">
          {leadingIcon && (
            <div
              className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--color-text-tertiary)] transition-colors"
              aria-hidden="true"
            >
              {leadingIcon}
            </div>
          )}
          {leadingAdjunct && (
            <div
              className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            >
              {leadingAdjunct}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            className={cn(
              'w-full',
              'bg-[var(--color-bg-base)]',
              'border border-[var(--color-border-default)]',
              'rounded-[var(--radius-md)]',
              'text-[var(--text-base)] text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-disabled)]',
              'transition-all duration-[var(--duration-fast)] easing-[var(--easing-enter)]',
              'focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
              'focus-visible:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-bg-hover)]',
              'hover:not(:disabled):border-[var(--color-text-tertiary)]',
              error
                ? 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]'
                : '',
              leadingIcon && 'pl-10',
              leadingAdjunct && 'pl-10',
              trailingIcon && 'pr-10',
              trailingAdjunct && 'pr-10',
              'py-3 px-4',
              className
            )}
            {...props}
          />
          {trailingIcon && (
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--color-text-tertiary)] transition-colors"
              aria-hidden="true"
            >
              {trailingIcon}
            </div>
          )}
          {trailingAdjunct && (
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            >
              {trailingAdjunct}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <div
            id={error ? errorId : helperId}
            role={error ? 'alert' : 'status'}
            aria-live={error ? 'assertive' : 'polite'}
            className={cn(
              'mt-1.5 text-[var(--text-sm)] transition-colors duration-[var(--duration-fast)]',
              error
                ? 'text-[var(--color-error)] flex items-center gap-1'
                : 'text-[var(--color-text-tertiary)]'
            )}
          >
            {error && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {error || helperText}
          </div>
        )}
      </div>
    )
  }
);

Input.displayName = 'Input';

// ============================================================================
// TEXTAREA
// ============================================================================

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      placeholder,
      helperText,
      error,
      fullWidth = true,
      disabled = false,
      required,
      optional,
      maxLength,
      showCharacterCount = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const helperId = helperText || error ? `${textareaId}-helper` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const countId = showCharacterCount ? `${textareaId}-count` : undefined;

    const describedBy = [helperId, errorId, countId].filter(Boolean).join(' ') || undefined;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (maxLength && e.target.value.length > maxLength) {
        e.target.value = e.target.value.slice(0, maxLength);
      }
      props.onChange?.(e);
    };

    return (
      <div className={cn('w-full max-w-full', fullWidth && 'w-full')}>
        {label && (
          <Label htmlFor={textareaId} required={required} optional={optional}>
            {label}
          </Label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            onChange={handleChange}
            className={cn(
              'w-full',
              'bg-[var(--color-bg-base)]',
              'border border-[var(--color-border-default)]',
              'rounded-[var(--radius-md)]',
              'text-[var(--text-base)] text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-disabled)]',
              'transition-all duration-[var(--duration-fast)] easing-[var(--easing-enter)]',
              'focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
              'focus-visible:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-bg-hover)]',
              'hover:not(:disabled):border-[var(--color-text-tertiary)]',
              'resize-y min-h-[100px]',
              'py-3 px-4',
              error
                ? 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]'
                : '',
              className
            )}
            {...props}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          {(helperText || error) && (
            <div
              id={error ? errorId : helperId}
              role={error ? 'alert' : 'status'}
              aria-live={error ? 'assertive' : 'polite'}
              className={cn(
                'text-[var(--text-sm)] transition-colors duration-[var(--duration-fast)]',
                error
                  ? 'text-[var(--color-error)] flex items-center gap-1'
                  : 'text-[var(--color-text-tertiary)]'
              )}
            >
              {error && (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {error || helperText}
            </div>
          )}
          {showCharacterCount && maxLength && (
            <div
              id={countId}
              className={cn(
                'text-[var(--text-xs)] font-mono tabular-nums transition-colors duration-[var(--duration-fast)]',
                props.value?.length >= maxLength * 0.9
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-text-tertiary)]'
              )}
              aria-live="polite"
            >
              {props.value?.length || 0} / {maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================================
// SELECT
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  multiple?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      placeholder,
      helperText,
      error,
      options,
      fullWidth = true,
      disabled = false,
      required,
      optional,
      multiple = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const helperId = helperText || error ? `${selectId}-helper` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;

    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('w-full max-w-full', fullWidth && 'w-full')}>
        {label && (
          <Label htmlFor={selectId} required={required} optional={optional}>
            {label}
          </Label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            multiple={multiple}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            className={cn(
              'w-full appearance-none',
              'bg-[var(--color-bg-base)]',
              'border border-[var(--color-border-default)]',
              'rounded-[var(--radius-md)]',
              'text-[var(--text-base)] text-[var(--color-text-primary)]',
              'transition-all duration-[var(--duration-fast)] easing-[var(--easing-enter)]',
              'focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
              'focus-visible:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-bg-hover)]',
              'hover:not(:disabled):border-[var(--color-text-tertiary)]',
              error
                ? 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]'
                : '',
              'py-3 px-4 pr-10',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled selected hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) =>
              option.group ? (
                <optgroup key={`group-${option.value}`} label={option.group}>
                  {options
                    .filter((o) => o.group === option.group)
                    .map((o) => (
                      <option
                        key={o.value}
                        value={o.value}
                        disabled={o.disabled}
                      >
                        {o.label}
                      </option>
                    ))}
                </optgroup>
              ) : (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              )
            )}
          </select>
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--color-text-tertiary)]"
            aria-hidden="true"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {(helperText || error) && (
          <div
            id={error ? errorId : helperId}
            role={error ? 'alert' : 'status'}
            aria-live={error ? 'assertive' : 'polite'}
            className={cn(
              'mt-1.5 text-[var(--text-sm)] transition-colors duration-[var(--duration-fast)]',
              error
                ? 'text-[var(--color-error)] flex items-center gap-1'
                : 'text-[var(--color-text-tertiary)]'
            )}
          >
            {error && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================================================
// CHECKBOX
// ============================================================================

export interface CheckboxProps extends Omit<HTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate, disabled = false, required, className, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;
    const inputRef = ref || (() => {});

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
          <input
            ref={inputRef}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            required={required}
            aria-checked={indeterminate ? 'mixed' : props.checked}
            className={cn(
              'appearance-none',
              'w-5 h-5',
              'rounded-[var(--radius-xs)]',
              'border-2 border-[var(--color-border-default)]',
              'bg-[var(--color-bg-base)]',
              'transition-all duration-[var(--duration-fast)] easing-[var(--easing-enter)]',
              'focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',
              'cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'checked:bg-[var(--color-gold-500)] checked:border-[var(--color-gold-500)]',
              'checked:after:content-[""] checked:after:absolute checked:after:w-[6px] checked:after:h-[10px] checked:after:border-2 checked:after:border-[var(--color-text-on-gold)] checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:top-[-2px] checked:after:left-[2px]',
              'indeterminate:bg-[var(--color-gold-500)] indeterminate:border-[var(--color-gold-500)]',
              'indeterminate:after:content-[""] indeterminate:after:absolute indeterminate:after:w-[12px] indeterminate:after:h-[2px] indeterminate:after:bg-[var(--color-text-on-gold)] indeterminate:after:top-1/2 indeterminate:after:left-1/2 indeterminate:after:-translate-x-1/2 indeterminate:after:-translate-y-1/2',
              className
            )}
            {...props}
          />
          {indeterminate && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div className="w-[12px] h-[2px] bg-[var(--color-text-on-gold)] rounded" />
            </div>
          )}
        </div>
        <label
          htmlFor={checkboxId}
          className={cn(
            'text-[var(--text-base)] text-[var(--color-text-primary)]',
            'cursor-pointer select-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================================================
// RADIO
// ============================================================================

export interface RadioProps extends Omit<HTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  value: string;
  name: string;
  disabled?: boolean;
  required?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, value, name, disabled = false, required, className, id, ...props }, ref) => {
    const radioId = id || `radio-${name}-${value}`;

    return (
      <div className="flex items-center gap-3">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          name={name}
          value={value}
          disabled={disabled}
          required={required}
          className={cn(
            'appearance-none',
            'w-5 h-5',
            'rounded-full',
            'border-2 border-[var(--color-border-default)]',
            'bg-[var(--color-bg-base)]',
            'transition-all duration-[var(--duration-fast)] easing-[var(--easing-enter)]',
            'focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',
            'cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'checked:border-[var(--color-gold-500)]',
            'checked:after:content-[""] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:w-[10px] checked:after:h-[10px] checked:after:bg-[var(--color-gold-500)] checked:after:rounded-full checked:after:-translate-x-1/2 checked:after:-translate-y-1/2',
            className
          )}
          {...props}
        />
        <label
          htmlFor={radioId}
          className={cn(
            'text-[var(--text-base)] text-[var(--color-text-primary)]',
            'cursor-pointer select-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// ============================================================================
// RADIO GROUP
// ============================================================================

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  direction?: 'vertical' | 'horizontal';
  error?: string;
  label?: string;
  required?: boolean;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  direction = 'vertical',
  error,
  label,
  required,
  className,
  id,
  ...props
}: RadioGroupProps) {
  const groupId = id || `radiogroup-${name}`;

  return (
    <fieldset
      id={groupId}
      className={cn('w-full', className)}
      {...props}
    >
      {label && (
        <legend className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)] mb-3">
          {label}
          {required && <span className="text-[var(--color-error)] ml-0.5" aria-hidden="true">*</span>}
        </legend>
      )}
      <div
        className={cn(
          'flex',
          direction === 'vertical' ? 'flex-col gap-3' : 'flex-wrap gap-4',
          'gap-3'
        )}
        role="radiogroup"
        aria-label={label}
        aria-invalid={error ? 'true' : 'false'}
        aria-errormessage={error ? `${groupId}-error` : undefined}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.currentTarget.value)}
          />
        ))}
      </div>
      {error && (
        <div
          id={`${groupId}-error`}
          role="alert"
          aria-live="assertive"
          className="mt-2 text-[var(--text-sm)] text-[var(--color-error)] flex items-center gap-1"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}
    </fieldset>
  );
}

// ============================================================================
// SWITCH
// ============================================================================

export interface SwitchProps extends Omit<HTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-5 after:w-4 after:h-4 after:translate-x-[2px] checked:after:translate-x-[2px]',
  md: 'w-11 h-6 after:w-5 after:h-5 after:translate-x-[2px] checked:after:translate-x-[4px]',
  lg: 'w-14 h-7 after:w-6 after:h-6 after:translate-x-[2px] checked:after:translate-x-[6px]',
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, checked, onChange, disabled = false, size = 'md', className, id, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex items-center gap-3">
        <button
          role="switch"
          type="button"
          id={switchId}
          aria-checked={checked}
          aria-disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            'relative inline-flex items-center',
            'rounded-full',
            'bg-[var(--color-border-default)]',
            'transition-all duration-[var(--duration-fast)] easing-[var(--easing-spring)]',
            'focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            checked && 'bg-[var(--color-gold-500)]',
            sizeClasses[size],
            className
          )}
        >
          <span
            className={cn(
              'absolute top-1/2 left-1',
              'rounded-full',
              'bg-[var(--color-bg-base)]',
              'shadow-[var(--shadow-md)]',
              'transition-transform duration-[var(--duration-fast)] easing-[var(--easing-spring)]',
              'after:content-[""] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-[var(--color-text-tertiary)]',
              'checked:after:right-auto'
            )}
            aria-hidden="true"
          />
        </button>
        {label && (
          <label
            htmlFor={switchId}
            className={cn(
              'text-[var(--text-base)] text-[var(--color-text-primary)]',
              'cursor-pointer select-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

// ============================================================================
// SLIDER
// ============================================================================

export interface SliderProps extends Omit<HTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  min: number;
  max: number;
  step?: number;
  value: number | [number, number];
  onChange: (value: number | [number, number]) => void;
  disabled?: boolean;
  marks?: Array<{ value: number; label?: string }>;
  label?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ min, max, step = 1, value, onChange, disabled = false, marks, label, className, id, ...props }, ref) => {
    const sliderId = id || `slider-${Math.random().toString(36).slice(2, 9)}`;
    const isRange = Array.isArray(value);
    const values = isRange ? value : [value];
    const percentages = values.map((v) => ((v - min) / (max - min)) * 100);

    const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      const handleMove = (moveEvent: MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
        const newValue = min + (percent / 100) * (max - min);
        const steppedValue = Math.round(newValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, steppedValue));
        const newValues = [...values];
        newValues[index] = clampedValue;
        onChange(isRange ? newValues.sort((a, b) => a - b) : clampedValue);
      };
      const handleUp = () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    };

    const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
      let newValue = values[index];
      const stepValue = step;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(max, newValue + stepValue);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(min, newValue - stepValue);
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }
      const newValues = [...values];
      newValues[index] = newValue;
      onChange(isRange ? newValues.sort((a, b) => a - b) : newValue);
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <Label htmlFor={sliderId} className="mb-2">
            {label}
          </Label>
        )}
        <div className="relative" role="slider" aria-multiselectable={isRange}>
          <div className="relative h-2">
            {/* Track */}
            <div
              className="absolute inset-y-0 left-0 right-0 h-full bg-[var(--color-border-default)] rounded-full"
              aria-hidden="true"
            />
            {/* Active Track */}
            {isRange && (
              <div
                className="absolute inset-y-0 h-full bg-[var(--color-gold-500)] rounded-full"
                style={{
                  left: `${percentages[0]}%`,
                  right: `${100 - percentages[1]}%`,
                }}
                aria-hidden="true"
              />
            )}
            {!isRange && (
              <div
                className="absolute inset-y-0 left-0 h-full bg-[var(--color-gold-500)] rounded-full"
                style={{ width: `${percentages[0]}%` }}
                aria-hidden="true"
              />
            )}
            {/* Thumbs */}
            {values.map((_, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={handleMouseDown(index)}
                onKeyDown={handleKeyDown(index)}
                disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                role="slider"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={values[index]}
                aria-orientation="horizontal"
                className={cn(
                  'absolute top-1/2',
                  'w-5 h-5 rounded-full',
                  'bg-[var(--color-bg-base)]',
                  'border-2 border-[var(--color-gold-500)]',
                  'shadow-[var(--shadow-md)]',
                  'transform -translate-x-1/2 -translate-y-1/2',
                  'transition-transform duration-[var(--duration-fast)] easing-[var(--easing-spring)]',
                  'focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'active:scale-125',
                  index === 0
                    ? `left-[${percentages[0]}%]`
                    : `left-[${percentages[1]}%]`
                )}
                style={{
                  left: `${percentages[index]}%`,
                }}
              />
            ))}
          </div>
          {/* Marks */}
          {marks && marks.length > 0 && (
            <div className="mt-3 flex justify-between">
              {marks.map((mark) => (
                <div
                  key={mark.value}
                  className="flex flex-col items-center"
                  style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}
                >
                  <div
                    className="w-1 h-1 rounded-full bg-[var(--color-border-default)]"
                    aria-hidden="true"
                  />
                  {mark.label && (
                    <span className="mt-1 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                      {mark.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between mt-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)] font-mono tabular-nums">
          <span>{min}</span>
          <span>{isRange ? `${values[0]} - ${values[1]}` : values[0]}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';