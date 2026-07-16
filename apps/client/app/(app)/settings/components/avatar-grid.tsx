'use client';

import { MemojiAvatar } from '@/components/ui/memoji-avatar';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { AVATAR_SEEDS } from '../lib/constants';

interface AvatarGridProps {
  value: string;
  onChange: (value: string) => void;
}

export function AvatarGrid({ value, onChange }: AvatarGridProps) {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {AVATAR_SEEDS.map((seed) => {
        const active = seed === value;
        return (
          <button
            key={seed}
            type="button"
            onClick={() => onChange(seed)}
            className={cn(
              'relative p-1 rounded-full transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted'
            )}
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
  );
}
