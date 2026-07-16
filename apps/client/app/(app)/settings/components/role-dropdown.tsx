'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRoleLabel } from '../lib/role-utils';
import type { User } from '@/lib/api';
import type { Dictionary } from '@/lib/i18n/types';

interface RoleDropdownProps {
  current: User['role'];
  onSelect: (role: User['role']) => void;
  t: Dictionary;
}

const ROLES: User['role'][] = ['admin', 'editor', 'viewer'];

export function RoleDropdown({ current, onSelect, t }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 hover:bg-slate-200 transition-colors"
      >
        {getRoleLabel(t, current)} <ChevronDown size={10} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[130px] rounded-md border border-border/60 bg-popover p-1">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => { onSelect(r); setOpen(false); }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors',
                r === current && 'bg-primary/5 text-primary'
              )}
            >
              {getRoleLabel(t, r)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
