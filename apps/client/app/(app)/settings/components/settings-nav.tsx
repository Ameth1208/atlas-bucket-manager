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
  account: 'from-[#007aff] to-[#0051c7] shadow-[#007aff]/30',
  team: 'from-[#34c759] to-[#248a3d] shadow-[#34c759]/30',
  integrations: 'from-[#ff9500] to-[#e65100] shadow-[#ff9500]/30',
  security: 'from-[#ff3b30] to-[#d70015] shadow-[#ff3b30]/30',
};

export function SettingsNav({ sections, active, onSelect }: SettingsNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {sections.map((s) => {
        const isSelected = active === s.id;
        const color = SECTION_COLORS[s.id] || 'from-primary to-primary/80';
        return (
          <button
            type="button"
            key={s.id}
            aria-current={isSelected ? 'page' : undefined}
            onClick={() => onSelect(s.id)}
            className={cn(
              'group relative flex items-center justify-between px-3 py-2.5 rounded-[12px] text-[13px] font-medium transition-all duration-150 cursor-pointer',
              isSelected
                ? 'bg-white/[0.1] text-foreground font-semibold shadow-xs ring-1 ring-white/10'
                : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  'size-7 rounded-[8px] bg-gradient-to-b flex items-center justify-center shrink-0 shadow-xs ring-1 ring-white/20',
                  color
                )}
              >
                <s.icon size={14} className="text-white" strokeWidth={2.2} />
              </div>
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
