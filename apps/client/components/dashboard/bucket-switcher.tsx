'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Database, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useBuckets } from '@/hooks/use-buckets';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { Bucket } from '@/lib/api';

interface BucketSwitcherProps {
  current: Bucket;
}

export function BucketSwitcher({ current }: BucketSwitcherProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { buckets } = useBuckets();

  // Group by provider, current provider first.
  const groups = useMemo(() => {
    const byProvider = new Map<string, { providerName: string; buckets: Bucket[] }>();
    for (const b of buckets) {
      const existing = byProvider.get(b.providerId);
      if (existing) {
        existing.buckets.push(b);
      } else {
        byProvider.set(b.providerId, { providerName: b.providerName ?? '—', buckets: [b] });
      }
    }
    const currentId = current.providerId;
    return Array.from(byProvider.entries())
      .sort(([a], [b]) => {
        if (a === currentId) return -1;
        if (b === currentId) return 1;
        return 0;
      })
      .map(([id, entry]) => ({ id, ...entry }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- current.providerId captured via currentId
  }, [buckets]);

  const filterBucket = (b: Bucket) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return b.name.toLowerCase().includes(q) || (b.providerName ?? '').toLowerCase().includes(q);
  };

  const select = (b: Bucket) => {
    setOpen(false);
    setQuery('');
    router.push(`/buckets/${encodeURIComponent(b.name)}?provider=${b.providerId}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-canvas text-[12.5px] font-medium text-foreground hover:bg-muted transition-colors',
        )}
        title={t.bucketSwitcherTitle}
      >
        <Database size={12} className="text-muted-foreground" />
        <span>{t.bucketSwitcherTitle}</span>
        <ChevronsUpDown size={12} className="text-muted-foreground opacity-70" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-80 p-0">
        <div className="px-3 py-2 border-b border-border">
          <span className="text-[12px] font-semibold text-foreground">{t.bucketSwitcherAll}</span>
        </div>
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.bucketSwitcherSearchPh}
              className="h-8 pl-7 text-[12px] rounded-md"
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {groups.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">
              Sin buckets
            </div>
          ) : (
            groups.map((g) => {
              const visible = g.buckets.filter(filterBucket);
              if (visible.length === 0) return null;
              return (
                <div key={g.id} className="pb-1">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.providerName}
                    {g.id === current.providerId && (
                      <span className="ml-1.5 normal-case tracking-normal text-muted-foreground/60">
                        · actual
                      </span>
                    )}
                  </div>
                  {visible.map((b) => {
                    const active = b.name === current.name && b.providerId === current.providerId;
                    return (
                      <button
                        key={`${b.providerId}:${b.name}`}
                        type="button"
                        onClick={() => select(b)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] hover:bg-muted text-foreground"
                      >
                        <Database size={12} className="text-muted-foreground shrink-0" />
                        <span className="flex-1 text-left truncate font-medium">{b.name}</span>
                        {active && <Check size={12} className="text-foreground" />}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
