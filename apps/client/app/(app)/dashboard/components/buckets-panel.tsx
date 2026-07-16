'use client';

import { BucketsList } from '@/components/dashboard/buckets-list';
import { Search } from 'lucide-react';

interface BucketsPanelProps {
  search: string;
  setSearch: (value: string) => void;
  bucketsCount: number;
}

export function BucketsPanel({ search, setSearch, bucketsCount }: BucketsPanelProps) {
  return (
    <div className="lg:col-span-2 flex flex-col min-h-0 bg-card border border-border rounded-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.2px]">Buckets</h2>
          <p className="text-[12px] text-muted-foreground">{`${bucketsCount} buckets conectados`}</p>
        </div>
        <div className="relative flex items-center gap-2 w-full sm:w-64">
          <Search size={14} className="absolute left-3 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar buckets..."
            className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-md text-[13px] outline-none placeholder:text-muted-foreground/60 focus:border-border-strong transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
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
