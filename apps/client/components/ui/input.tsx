'use client';

import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { Eye, EyeOff, AlertCircle, Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  label?: string;
  icon?: LucideIcon;
  invalid?: boolean;
  valid?: boolean;
  className?: string;
}

function Input({
  className,
  type = 'text',
  label,
  icon: Icon,
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
  const hasFloatingLabel = !!label;

  return (
    <div
      className={cn(
        'group relative w-full rounded-md bg-background',
        'border border-input',
        'transition-colors',
        'hover:border-foreground/20',
        'focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-within:ring-destructive/20',
        hasError && 'border-destructive focus-within:ring-destructive/20',
        className,
      )}
    >
      <div className="relative flex items-center h-10">
        {Icon && (
          <div
            className={cn(
              'shrink-0 ml-3 transition-colors',
              hasError
                ? 'text-destructive'
                : hasSuccess
                  ? 'text-emerald-600'
                  : 'text-muted-foreground group-focus-within:text-foreground',
            )}
          >
            <Icon size={15} strokeWidth={1.8} />
          </div>
        )}

        <div className="relative flex-1 h-full">
          <InputPrimitive
            id={inputId}
            type={effectiveType}
            data-slot="input"
            placeholder={hasFloatingLabel ? ' ' : props.placeholder}
            aria-invalid={hasError || undefined}
            className={cn(
              'peer w-full h-full bg-transparent outline-none',
              'text-[14px] text-foreground',
              'placeholder:text-muted-foreground',
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              Icon ? 'pl-2.5' : 'pl-3.5',
              isPassword || hasSuccess || hasError ? 'pr-9' : 'pr-3.5',
            )}
            {...props}
          />

          {/* Floating label */}
          {hasFloatingLabel && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute pointer-events-none transition-all duration-150 origin-left',
                Icon ? 'left-2.5' : 'left-3.5',
                'top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground',
                'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[14px]',
                'peer-focus:top-0 peer-focus:translate-y-0 peer-focus:text-[10.5px] peer-focus:font-medium peer-focus:px-1.5 peer-focus:bg-background',
                'peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-[10.5px] peer-[&:not(:placeholder-shown)]:font-medium peer-[&:not(:placeholder-shown)]:px-1.5 peer-[&:not(:placeholder-shown)]:bg-background',
                hasError
                  ? 'peer-focus:text-destructive peer-[&:not(:placeholder-shown)]:text-destructive'
                  : 'peer-focus:text-foreground peer-[&:not(:placeholder-shown)]:text-foreground',
              )}
            >
              {label}
            </label>
          )}
        </div>

        {/* Right side icons: toggle / error / success */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
          </button>
        ) : hasError ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
            <AlertCircle size={15} strokeWidth={2} />
          </div>
        ) : hasSuccess ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
            <Check size={15} strokeWidth={2.5} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { Input };
export type { InputProps };
