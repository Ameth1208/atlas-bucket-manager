'use client';

import Link from 'next/link';
import { BucketsList } from '@/components/dashboard/buckets-list';
import { Search, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface BucketsPanelProps {
  search: string;
  setSearch: (value: string) => void;
  bucketsCount: number;
  className?: string;
}

export function BucketsPanel({ search, setSearch, bucketsCount, className }: BucketsPanelProps) {
  const { t, tx } = useI18n();
  return (
    <div
      className={cn(
        'lg:col-span-2 flex flex-col min-h-0 bg-card/75 backdrop-blur-2xl border border-white/[0.08] rounded-[20px] shadow-sm overflow-hidden',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border/60">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div>
            <h2 className="text-[16px] font-semibold text-foreground tracking-[-0.2px]">{t.dashboardBucketsTitle}</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {tx('dashboardBucketsSubtitle', { count: bucketsCount })}
            </p>
          </div>
          <Link
            href="/buckets"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline transition-all ml-1 px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/15 shrink-0"
          >
            <span>{t.dashboardViewAllBuckets}</span>
            <ArrowRight size={12} />
          </Link>
        </div>
        <div className="relative flex items-center gap-2 w-full sm:w-64">
          <Search size={14} className="absolute left-3 text-muted-foreground/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.dashboardBucketsSearchPh}
            className="w-full pl-9 pr-8 py-1.5 h-9 bg-background/50 hover:bg-background/80 focus:bg-background border border-border/70 rounded-full text-[13px] outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {t.dashboardBucketsClear}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <BucketsList search={search} />
      </div>
    </div>
  );
}
