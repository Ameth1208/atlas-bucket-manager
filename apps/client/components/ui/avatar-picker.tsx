'use client';
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { MemojiAvatar } from './memoji-avatar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

const AVATAR_SEEDS = [
  'atlas-1', 'atlas-2', 'atlas-3', 'atlas-4', 'atlas-5', 'atlas-6',
  'memoji-a', 'memoji-b', 'memoji-c', 'memoji-d', 'memoji-e', 'memoji-f',
  'user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6',
];

interface AvatarPickerProps {
  value: string;
  onChange: (value: string) => void;
  size?: number;
  label?: string;
  className?: string;
}

export function AvatarPicker({ value, onChange, size = 40, label, className }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          type="button"
          className={cn(
            'group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left hover:border-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className
          )}
        >
          <MemojiAvatar
            name={value}
            size={size}
            className="rounded-full shrink-0"
          />
          {label && <span className="text-sm text-muted-foreground hidden sm:inline">{label}</span>}
          <ChevronDown size={13} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2.5" align="start">
        <div className="grid grid-cols-6 gap-1.5">
          {AVATAR_SEEDS.map(seed => {
            const active = seed === value;
            return (
              <button
                key={seed}
                type="button"
                onClick={() => { onChange(seed); setOpen(false); }}
                className={cn(
                  'relative p-1 rounded-full transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted'
                )}
                title={seed}
              >
                <MemojiAvatar name={seed} size={36} className="rounded-full" />
                {active && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center border border-background">
                    <Check size={9} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
