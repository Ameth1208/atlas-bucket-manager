'use client';

import { BucketsList } from '@/components/dashboard/buckets-list';
import { Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface BucketsPanelProps {
  search: string;
  setSearch: (value: string) => void;
  bucketsCount: number;
}

export function BucketsPanel({ search, setSearch, bucketsCount }: BucketsPanelProps) {
  const { t, tx } = useI18n();
  return (
    <div className="lg:col-span-2 flex flex-col min-h-0 bg-card border border-border/80 rounded-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border/70">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.2px]">{t.dashboardBucketsTitle}</h2>
          <p className="text-[12px] text-muted-foreground">
            {tx('dashboardBucketsSubtitle', { count: bucketsCount })}
          </p>
        </div>
        <div className="relative flex items-center gap-2 w-full sm:w-64">
          <Search size={14} className="absolute left-3 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.dashboardBucketsSearchPh}
            className="w-full pl-9 pr-8 py-1.5 h-9 bg-muted/60 hover:bg-muted focus:bg-background border border-border/80 rounded-full text-[13px] outline-none placeholder:text-muted-foreground/60 focus:border-primary-focus focus:ring-2 focus:ring-primary-focus/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.dashboardBucketsClear}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <BucketsList search={search} />
      </div>
    </div>
  );
}
