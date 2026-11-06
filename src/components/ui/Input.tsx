import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      className,
      id,
      ...rest
    },
    ref,
  ) {
    const inputId = id ?? rest.name ?? label;
    return (
      <label className="block w-full" htmlFor={inputId}>
        {label && (
          <span className="mb-1.5 block text-sm font-medium text-text-secondary">
            {label}
          </span>
        )}
        <span className="relative block">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'h-11 w-full rounded-xl border border-border bg-bg-secondary px-3.5 text-sm text-text-primary placeholder:text-text-muted',
              'transition-colors outline-none focus:border-accent-primary/70 focus:ring-2 focus:ring-accent-primary/15',
              'disabled:cursor-not-allowed disabled:opacity-60',
              Boolean(leftIcon) && 'pl-10',
              Boolean(rightElement) && 'pr-11',
              error && 'border-red/70 focus:border-red focus:ring-red/15',
              className,
            )}
            {...rest}
          />
          {rightElement && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightElement}
            </span>
          )}
        </span>
        {error ? (
          <span className="mt-1.5 block text-xs text-red">{error}</span>
        ) : hint ? (
          <span className="mt-1.5 block text-xs text-text-muted">{hint}</span>
        ) : null}
      </label>
    );
  },
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, options, className, id, ...rest }, ref) {
    const selectId = id ?? rest.name ?? label;
    return (
      <label className="block w-full" htmlFor={selectId}>
        {label && (
          <span className="mb-1.5 block text-sm font-medium text-text-secondary">
            {label}
          </span>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border border-border bg-bg-secondary px-3.5 text-sm text-text-primary',
            'outline-none transition-colors focus:border-accent-primary/70 focus:ring-2 focus:ring-accent-primary/15',
            error && 'border-red/70',
            className,
          )}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="mt-1.5 block text-xs text-red">{error}</span>}
      </label>
    );
  },
);
