'use client';

import { useState } from 'react';
import { KeyRound, Trash2, MoreHorizontal } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';

interface UserActionsMenuProps {
  onReset: () => void;
  onDelete: () => void;
  t: Dictionary;
}

export function UserActionsMenu({ onReset, onDelete, t }: UserActionsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Acciones de usuario"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border border-border/60 bg-popover p-1">
          <button
            type="button"
            onClick={() => { onReset(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors"
          >
            <KeyRound size={13} /> {t.settingsResetPassword}
          </button>
          <button
            type="button"
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={13} /> {t.delete}
          </button>
        </div>
      )}
    </div>
  );
}
