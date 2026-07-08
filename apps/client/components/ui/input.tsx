'use client';

import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { Eye, EyeOff, AlertCircle, Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  label?: string;
  icon?: LucideIcon;
  hint?: string;
  invalid?: boolean;
  valid?: boolean;
  className?: string;
}

function Input({
  className,
  type = 'text',
  label,
  icon: Icon,
  hint,
  invalid,
  valid,
  id,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;
  const hasError = invalid;
  const hasSuccess = valid && !invalid;
  const inputId = id ?? React.useId();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'group relative w-full rounded-lg bg-background',
          'border border-foreground/15',
          'transition-all duration-150',
          'shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
          'hover:border-foreground/25',
          'focus-within:border-foreground focus-within:ring-[3px] focus-within:ring-foreground/10',
          'has-[input:invalid]:border-destructive has-[input:invalid]:focus-within:ring-destructive/15',
          hasError && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/15',
          className,
        )}
      >
        <div className="relative flex items-center h-11">
          {Icon && (
            <div
              className={cn(
                'shrink-0 ml-3.5 transition-colors',
                hasError
                  ? 'text-destructive'
                  : hasSuccess
                    ? 'text-emerald-600'
                    : 'text-foreground/50 group-focus-within:text-foreground',
              )}
            >
              <Icon size={16} strokeWidth={1.8} />
            </div>
          )}

          <InputPrimitive
            id={inputId}
            type={effectiveType}
            data-slot="input"
            aria-invalid={hasError || undefined}
            className={cn(
              'w-full h-full bg-transparent outline-none',
              'text-[15px] text-foreground',
              'placeholder:text-foreground/35',
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              Icon ? 'pl-2.5' : 'px-3.5',
              isPassword || hasSuccess || hasError ? 'pr-10' : 'pr-3.5',
            )}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded text-foreground/50 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
            </button>
          ) : hasError ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
              <AlertCircle size={16} strokeWidth={2} />
            </div>
          ) : hasSuccess ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
              <Check size={16} strokeWidth={2.5} />
            </div>
          ) : null}
        </div>
      </div>
      {hint && (
        <p
          className={cn(
            'text-[12px] mt-1.5 ml-1',
            hasError ? 'text-destructive' : 'text-foreground/55',
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export { Input };
export type { InputProps };
