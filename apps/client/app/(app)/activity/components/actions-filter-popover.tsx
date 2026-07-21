'use client';

import { Activity as ActivityIcon, ChevronDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  GROUP_LABELS,
  getActionMeta,
  type ActivityAction,
} from '../lib/action-meta';
import { GROUP_ORDER } from '../lib/activity-aggregation';
import { useI18n } from '@/lib/i18n';

interface ActionsFilterPopoverProps {
  actions: ActivityAction[];
  onToggle: (a: ActivityAction) => void;
  onClear: () => void;
  counts: Record<string, number>;
  grouped: Record<string, ActivityAction[]>;
}

export function ActionsFilterPopover({
  actions,
  onToggle,
  onClear,
  counts,
  grouped,
}: ActionsFilterPopoverProps) {
  const { t } = useI18n();
  const selected = actions.length;
  const selectedSet = new Set(actions);
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-1.5 h-8 pl-2.5 pr-2.5 rounded-full border text-[12px] font-medium transition-colors',
          selected > 0
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-canvas text-foreground hover:bg-muted',
        )}
      >
        <ActivityIcon size={12} />
        <span>{t.activityFilterAction}</span>
        {selected > 0 && (
          <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold tabular-nums bg-background/20 text-background">
            {selected}
          </span>
        )}
        <ChevronDown size={12} className="opacity-70" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-72 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-[12px] font-semibold text-foreground">
            {t.activityFilterAction}
          </span>
          {selected > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <X size={10} /> {t.activityFilterClear}
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-2">
          {GROUP_ORDER.map((g) => (
            <div key={g}>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {GROUP_LABELS[g]}
              </div>
              <div className="space-y-0.5">
                {(grouped[g] ?? []).map((a) => (
                  <ActionRow
                    key={a}
                    action={a}
                    checked={selectedSet.has(a)}
                    count={counts[a] ?? 0}
                    onToggle={() => onToggle(a)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ActionRowProps {
  action: ActivityAction;
  checked: boolean;
  count: number;
  onToggle: () => void;
}

function ActionRow({ action, checked, count, onToggle }: ActionRowProps) {
  const meta = getActionMeta(action);
  const Icon = meta.icon;
  return (
    <label className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <span
        className={cn(
          'inline-flex items-center justify-center w-5 h-5 rounded',
          meta.iconBg,
        )}
      >
        <Icon size={11} />
      </span>
      <span className="flex-1 text-[12.5px] text-foreground">{meta.short}</span>
      <span className="text-[10.5px] tabular-nums text-muted-foreground">{count}</span>
    </label>
  );
}
