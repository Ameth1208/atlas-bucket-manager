'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Reset page when entries count or filter changes
  useEffect(() => {
    setPage(1);
  }, [entries.length]);

  const totalPages = Math.ceil(entries.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedEntries = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return entries.slice(start, start + pageSize);
  }, [entries, safePage, pageSize]);

  if (isLoading) {
    return (
      <Card className="border border-white/[0.08] bg-card/60 backdrop-blur-2xl rounded-[18px] overflow-hidden shadow-sm">
        <div className="grid grid-cols-[110px_1.2fr_140px_2fr_140px] gap-3 px-4 py-2.5 border-b border-border/60 bg-muted/30">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[110px_1.2fr_140px_2fr_140px] gap-3 px-4 py-3 border-b border-border/40 last:border-b-0"
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
      <Card className="border border-white/[0.08] bg-card/60 backdrop-blur-2xl rounded-[18px] p-12 text-center shadow-sm">
        <p className="text-muted-foreground text-[13px]">{t.activityEmpty}</p>
      </Card>
    );
  }

  const startRecord = (safePage - 1) * pageSize + 1;
  const endRecord = Math.min(safePage * pageSize, entries.length);

  return (
    <Card className="border border-white/[0.08] bg-card/65 backdrop-blur-2xl rounded-[18px] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-[110px_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,2fr)_minmax(0,1.1fr)] gap-3 px-4 py-3 border-b border-border/60 bg-muted/25 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <div>{t.activityColWhen}</div>
            <div>{t.activityColActor}</div>
            <div>{t.activityColAction}</div>
            <div>{t.activityColDetail}</div>
            <div>{t.activityColBucket}</div>
          </div>

          <div className="divide-y divide-border/40">
            {paginatedEntries.map((a) => {
              const actionMeta = getActionMeta(a.action, t);
              const Icon = actionMeta.icon;
              return (
                <div
                  key={a.id}
                  className="grid grid-cols-[110px_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,2fr)_minmax(0,1.1fr)] gap-3 items-center px-4 py-2.5 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="text-[12px] text-muted-foreground tabular-nums" title={formatDate(a.createdAt, meta.htmlLang, timeZone)}>
                    <div className="text-foreground font-medium">{formatRelative(a.createdAt, t, tx)}</div>
                    <div className="text-[10.5px] text-muted-foreground/80">{formatDate(a.createdAt, meta.htmlLang, timeZone)}</div>
                  </div>

                  <div className="text-[12.5px] text-foreground font-mono truncate" title={a.actor}>
                    {a.actor}
                  </div>

                  <div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-transform',
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
                        <span className="font-semibold text-foreground">{a.target}</span>
                      </>
                    )}
                  </div>

                  <div className="text-[12.5px] text-muted-foreground truncate" title={a.bucket}>
                    {a.bucket || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Apple Liquid Glass Pagination Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-border/60 bg-muted/15 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            {t.paginationShowing}{' '}
            <strong className="font-semibold text-foreground tabular-nums">
              {startRecord}–{endRecord}
            </strong>{' '}
            {t.paginationOf}{' '}
            <strong className="font-semibold text-foreground tabular-nums">
              {entries.length}
            </strong>
          </span>

          <span className="text-muted-foreground/40 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[11px]">{t.paginationRowsPerPage}:</span>
            {[10, 15, 25, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setPageSize(size);
                  setPage(1);
                }}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                  pageSize === size
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] text-muted-foreground font-medium mr-1">
            {t.paginationPage}{' '}
            <strong className="text-foreground font-semibold tabular-nums">
              {safePage}
            </strong>{' '}
            {t.paginationOf}{' '}
            <strong className="text-foreground font-semibold tabular-nums">
              {totalPages}
            </strong>
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              disabled={safePage <= 1}
              onClick={() => setPage(1)}
              title="First page"
              aria-label="First page"
              className="rounded-[8px] h-7 w-7"
            >
              <ChevronsLeft size={13} />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title={t.paginationPrev}
              aria-label={t.paginationPrev}
              className="rounded-[8px] h-7 w-7"
            >
              <ChevronLeft size={13} />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title={t.paginationNext}
              aria-label={t.paginationNext}
              className="rounded-[8px] h-7 w-7"
            >
              <ChevronRight size={13} />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              disabled={safePage >= totalPages}
              onClick={() => setPage(totalPages)}
              title="Last page"
              aria-label="Last page"
              className="rounded-[8px] h-7 w-7"
            >
              <ChevronsRight size={13} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
