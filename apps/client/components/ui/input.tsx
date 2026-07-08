'use client';

import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { Eye, EyeOff, AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  icon?: LucideIcon;
  invalid?: boolean;
  error?: string;
  className?: string;
}

function Input({
  className,
  type = 'text',
  icon: Icon,
  invalid,
  error,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;
  const hasError = invalid || !!error;

  return (
    <div className="relative w-full">
      {Icon && (
        <div
          className={cn(
            'absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors',
            hasError
              ? 'text-[#FF3B30]'
              : 'text-[#86868B] group-focus-within:text-[#0071E3]',
          )}
        >
          <Icon size={15} strokeWidth={1.8} />
        </div>
      )}

      <InputPrimitive
        type={effectiveType}
        data-slot="input"
        aria-invalid={hasError || undefined}
        className={cn(
          'w-full min-w-0 rounded-[10px] border bg-white/70 backdrop-blur-sm',
          'h-11 sm:h-12 px-3.5 text-[14px] sm:text-[14.5px] text-[#1D1D1F]',
          'placeholder:text-[#A1A1A6]',
          'outline-none transition-all duration-150',
          'border-black/[0.08]',
          'hover:border-black/[0.15] hover:bg-white/85',
          'focus-visible:border-[#0071E3] focus-visible:bg-white focus-visible:shadow-[0_0_0_4px_rgba(0,113,227,0.12)]',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-[#FF3B30] aria-[invalid=true]:focus-visible:shadow-[0_0_0_4px_rgba(255,59,48,0.12)]',
          Icon && 'pl-10',
          isPassword && 'pr-10',
          hasError && 'border-[#FF3B30] focus-visible:border-[#FF3B30]',
          className,
        )}
        {...props}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] active:scale-95 transition-all"
        >
          {showPassword ? (
            <EyeOff size={15} strokeWidth={1.8} />
          ) : (
            <Eye size={15} strokeWidth={1.8} />
          )}
        </button>
      )}

      {!isPassword && hasError && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#FF3B30]">
          <AlertCircle size={15} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}

export { Input };
export type { InputProps };
