'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ActivityEntry } from '@/lib/api';
import { getActionMeta } from '@/app/(app)/activity/lib/action-meta';
import { useI18n } from '@/lib/i18n';

interface ActivityTableProps {
  entries: ActivityEntry[];
  isLoading: boolean;
}

function formatDate(ts: number, locale: string, timeZone: string): string {
  const d = new Date(ts * 1000);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone });
  }
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', timeZone }) +
    ' ' + d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone });
}

function formatRelative(
  ts: number,
  t: { activityTimeNow: string; activityTimeMin: string; activityTimeHour: string; activityTimeDay: string },
  interpolate: (key: 'activityTimeMin' | 'activityTimeHour' | 'activityTimeDay', vars: { n: number }) => string,
): string {
  const s = Math.floor(Date.now() / 1000 - ts / 1000);
  if (s < 60) return t.activityTimeNow;
  const m = Math.floor(s / 60);
  if (m < 60) return interpolate('activityTimeMin', { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return interpolate('activityTimeHour', { n: h });
  return interpolate('activityTimeDay', { n: Math.floor(h / 24) });
}

export function ActivityTable({ entries, isLoading }: ActivityTableProps) {
  const { t, tx, meta } = useI18n();
  const timeZone = 'UTC';
  if (isLoading) {
    return (
      <Card className="border-border overflow-hidden">
        <div className="grid grid-cols-[110px_1.2fr_140px_2fr_140px] gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[110px_1.2fr_140px_2fr_140px] gap-3 px-4 py-3 border-b border-border last:border-b-0"
          >
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="border-border">
        <div className="text-center py-16 text-muted-foreground text-[13px]">
          {t.activityEmpty}
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border overflow-hidden">
      <div className="grid grid-cols-[110px_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,2fr)_minmax(0,1.1fr)] gap-3 px-4 py-2.5 border-b border-border bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        <div>{t.activityColWhen}</div>
        <div>{t.activityColActor}</div>
        <div>{t.activityColAction}</div>
        <div>{t.activityColDetail}</div>
        <div>{t.activityColBucket}</div>
      </div>

      {entries.map((a) => {
        const actionMeta = getActionMeta(a.action);
        const Icon = actionMeta.icon;
        return (
          <div
            key={a.id}
            className="grid grid-cols-[110px_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,2fr)_minmax(0,1.1fr)] gap-3 items-center px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
          >
            <div className="text-[12px] text-muted-foreground tabular-nums" title={formatDate(a.createdAt, meta.htmlLang, timeZone)}>
              <div className="text-foreground">{formatRelative(a.createdAt, t, tx)}</div>
              <div className="text-[10.5px]">{formatDate(a.createdAt, meta.htmlLang, timeZone)}</div>
            </div>

            <div className="text-[12.5px] text-foreground font-mono truncate" title={a.actor}>
              {a.actor}
            </div>

            <div>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                  actionMeta.badge,
                )}
              >
                <Icon size={11} />
                {actionMeta.short}
              </span>
            </div>

            <div className="text-[12.5px] text-foreground truncate" title={a.target}>
              <span className="text-muted-foreground">{actionMeta.label}</span>
              {a.target && (
                <>
                  {' '}
                  <span className="font-medium">{a.target}</span>
                </>
              )}
            </div>

            <div className="text-[12.5px] text-muted-foreground truncate" title={a.bucket}>
              {a.bucket || '—'}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
