'use client';

import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { Eye, EyeOff, AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;
  const hasError = invalid;
  const generatedId = React.useId();
  const inputId = props.id ?? generatedId;

  const isSm = size === 'sm';
  const fieldHeight = isSm ? 'h-8' : 'h-10';
  const fieldPadding = isSm ? 'px-2.5' : 'px-3.5';
  const textSize = isSm ? 'text-[12.5px]' : 'text-[13.5px]';

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-foreground tracking-[-0.12px] mb-1"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative flex items-center rounded-xl bg-card border transition-all duration-150 shadow-2xs',
          fieldHeight,
          fieldPadding,
          hasError
            ? 'border-destructive ring-2 ring-destructive/20'
            : 'border-border/80 hover:border-border-strong focus-within:border-primary-focus focus-within:ring-2 focus-within:ring-primary-focus/20',
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
            aria-label={showPassword ? t.uiHidePassword : t.uiShowPassword}
            tabIndex={-1}
            className="p-1 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-focus"
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
