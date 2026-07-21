'use client';

import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface BucketsIndexToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  onCreate: () => void;
}

export function BucketsIndexToolbar({
  search,
  onSearchChange,
  onCreate,
}: BucketsIndexToolbarProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
      <div className="relative flex items-center gap-2 w-full sm:w-80">
        <Search size={14} className="absolute left-3 text-foreground/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.bucketsIndexSearchPh}
          className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-md text-[13px] outline-none placeholder:text-muted-foreground/60 focus:border-border-strong transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.bucketsIndexClear}
          </button>
        )}
      </div>
      <Button size="sm" onClick={onCreate}>
        <Plus size={13} /> {t.bucketsIndexNew}
      </Button>
    </div>
  );
}
