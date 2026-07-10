'use client';

import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { Eye, EyeOff, AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  label?: string;
  icon?: LucideIcon;
  invalid?: boolean;
  valid?: boolean;
  hint?: string;
  size?: 'default' | 'sm';
  className?: string;
}

function Input({
  className,
  type = 'text',
  label,
  icon: Icon,
  invalid,
  valid,
  hint,
  size = 'default',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;
  const hasError = invalid;
  const generatedId = React.useId();
  const inputId = props.id ?? generatedId;

  const isSm = size === 'sm';
  const fieldHeight = 'h-8';
  const fieldPadding = isSm ? 'px-2.5' : 'px-3';
  const textSize = 'text-sm';

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-semibold text-foreground tracking-[-0.12px] mb-1.5"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative flex items-center rounded-sm bg-card border transition-all duration-150',
          fieldHeight,
          fieldPadding,
          hasError
            ? 'border-destructive ring-1 ring-destructive/20'
            : 'border-border hover:border-foreground/25 focus-within:border-foreground/40 focus-within:ring-1 focus-within:ring-ring/10',
        )}
      >
        {Icon && (
          <div className={cn('shrink-0 mr-2.5', hasError ? 'text-destructive' : 'text-muted-foreground')}>
            <Icon size={15} strokeWidth={1.8} />
          </div>
        )}

        <InputPrimitive
          id={inputId}
          type={effectiveType}
          data-slot="input"
          placeholder={props.placeholder}
          aria-invalid={hasError || undefined}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none',
            textSize,
            'leading-[1.29] text-foreground tracking-[-0.224px]',
            'placeholder:text-muted-foreground/80',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isPassword || hasError ? 'pr-2' : 'pr-0',
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff size={14} strokeWidth={1.8} />
            ) : (
              <Eye size={14} strokeWidth={1.8} />
            )}
          </button>
        ) : hasError ? (
          <div className="text-destructive">
            <AlertCircle size={14} strokeWidth={2} />
          </div>
        ) : null}
      </div>
      {hint && (
        <p className={cn('text-[11px] sm:text-[12px] ml-1', hasError ? 'text-destructive' : 'text-muted-foreground')}>
          {hint}
        </p>
      )}
    </div>
  );
}

export { Input };
export type { InputProps };
