'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, User as UserIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface ActorFilterPopoverProps {
  value: string;
  onChange: (v: string) => void;
  actors: string[];
  onClear: () => void;
}

export function ActorFilterPopover({
  value,
  onChange,
  actors,
  onClear,
}: ActorFilterPopoverProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const apply = () => {
    onChange(draft.trim());
    setOpen(false);
  };

  const filtered = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return actors;
    return actors.filter((a) => a.toLowerCase().includes(q));
  }, [actors, draft]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-1.5 h-8 pl-2.5 pr-2.5 rounded-full border text-[12px] font-medium transition-colors',
          value
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-canvas text-foreground hover:bg-muted',
        )}
      >
        <UserIcon size={12} />
        <span>{value || t.activityFilterUser}</span>
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              setDraft('');
            }}
            className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-background/20 hover:bg-background/30"
            aria-label={t.activityFilterClear}
          >
            <X size={9} />
          </button>
        ) : (
          <ChevronDown size={12} className="opacity-70" />
        )}
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-72 p-0">
        <div className="px-3 py-2 border-b border-border">
          <span className="text-[12px] font-semibold text-foreground">
            {t.activityUserLabel}
          </span>
        </div>
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') apply();
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder={t.activityUserPh}
              className="h-8 pl-7 text-[12px] rounded-md"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-[12px] text-muted-foreground">
              {t.activityNoMatches}
            </div>
          ) : (
            filtered.map((a) => {
              const active = a === value;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    onChange(a);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] hover:bg-muted text-foreground"
                >
                  <span className="flex-1 text-left font-mono truncate">{a}</span>
                  {active && <Check size={12} className="text-foreground" />}
                </button>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5 px-2 py-2 border-t border-border bg-muted/20">
          <Button
            type="button"
            variant="pearl"
            size="sm"
            onClick={() => {
              onClear();
              setDraft('');
              setOpen(false);
            }}
          >
            {t.activityFilterClear}
          </Button>
          <Button type="button" size="sm" onClick={apply}>
            {t.activityApply}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
