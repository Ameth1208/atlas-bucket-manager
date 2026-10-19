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
          type="button"
          key={s.id}
          aria-current={active === s.id ? 'page' : undefined}
          onClick={() => onSelect(s.id)}
          className={cn(
            'group relative flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150',
            active === s.id
              ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
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
