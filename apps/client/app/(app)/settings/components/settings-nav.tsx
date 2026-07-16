'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { Section } from '../lib/types';

interface SettingsNavProps {
  sections: { id: Section; label: string; icon: LucideIcon }[];
  active: Section;
  onSelect: (section: Section) => void;
}

export function SettingsNav({ sections, active, onSelect }: SettingsNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={cn(
            'group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
            active === s.id
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          )}
        >
          <s.icon
            size={16}
            strokeWidth={active === s.id ? 2.5 : 2}
            className="shrink-0"
          />
          {s.label}
        </button>
      ))}
    </nav>
  );
}
