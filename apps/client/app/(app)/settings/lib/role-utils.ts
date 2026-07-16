import type { Dictionary } from '@/lib/i18n/types';
import type { User } from '@/lib/api';
import { cn } from '@/lib/utils';

export function getRoleLabel(t: Dictionary, role: User['role']) {
  switch (role) {
    case 'owner':
      return t.settingsRoleOwner;
    case 'admin':
      return t.settingsRoleAdmin;
    case 'editor':
      return t.settingsRoleEditor;
    case 'viewer':
      return t.settingsRoleViewer;
  }
}

export function getRoleStyle(role: User['role']) {
  return cn(
    'inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border',
    role === 'owner' &&
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
    role === 'admin' &&
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
    role === 'editor' &&
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
    role === 'viewer' &&
      'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800'
  );
}
