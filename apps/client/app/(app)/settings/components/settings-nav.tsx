'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import type { Section } from '../lib/types';

interface SettingsNavProps {
  sections: { id: Section; label: string; icon: LucideIcon }[];
  active: Section;
  onSelect: (section: Section) => void;
}

const SECTION_COLORS: Record<Section, string> = {
  account: 'text-[#007aff]',
  team: 'text-[#34c759]',
  integrations: 'text-[#ff9500]',
  security: 'text-[#ff3b30]',
};

export function SettingsNav({ sections, active, onSelect }: SettingsNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {sections.map((s) => {
        const isSelected = active === s.id;
        const iconColor = SECTION_COLORS[s.id] || 'text-primary';
        return (
          <button
            type="button"
            key={s.id}
            aria-current={isSelected ? 'page' : undefined}
            onClick={() => onSelect(s.id)}
            className={cn(
              'group relative flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-[13px] font-medium transition-all duration-150 cursor-pointer',
              isSelected
                ? 'bg-white/[0.1] text-foreground font-semibold shadow-xs ring-1 ring-white/10'
                : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <s.icon
                size={16}
                strokeWidth={2.2}
                className={cn(
                  'shrink-0 transition-colors',
                  isSelected ? iconColor : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="truncate">{s.label}</span>
            </div>
            <ChevronRight
              size={14}
              className={cn(
                'transition-transform opacity-40 group-hover:opacity-80',
                isSelected && 'opacity-90 text-foreground translate-x-0.5'
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
