'use client';
import { useState } from 'react';
import { Grid, List, Trash2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useBrowserStore } from '../store';
import { useActionsStore } from '../store/actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type Filter = 'all' | 'image' | 'video' | 'audio' | 'code' | 'doc' | 'archive';

const FILTERS: { value: Filter; i18nKey:
  | 'filterAll' | 'filterImages' | 'filterVideos' | 'filterAudio' | 'filterCode' | 'filterDocs' | 'filterArchives'
}[] = [
  { value: 'all', i18nKey: 'filterAll' },
  { value: 'image', i18nKey: 'filterImages' },
  { value: 'video', i18nKey: 'filterVideos' },
  { value: 'audio', i18nKey: 'filterAudio' },
  { value: 'code', i18nKey: 'filterCode' },
  { value: 'doc', i18nKey: 'filterDocs' },
  { value: 'archive', i18nKey: 'filterArchives' },
];

export function BucketToolbar() {
  const { t, tx } = useI18n();
  const { layout, setLayout, filter, setFilter, objects, selected, search, setSearch } = useBrowserStore();
  const { handleDelete } = useActionsStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[14px] font-semibold text-foreground">{t.bucketFilesCount}</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground tabular-nums">
            {objects.length}
          </span>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Input
            icon={Search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.bucketSearchPh}
            size="sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted z-10"
              aria-label={t.bucketSearchClear}
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="hidden md:flex items-center gap-0.5 p-0.5 rounded-md bg-muted border border-border">
          {FILTERS.map(f => (
            <button
              type="button"
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-2.5 py-1 text-[12px] font-medium rounded-md transition-colors',
                filter === f.value
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t[f.i18nKey]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-muted border border-border">
          <button
            type="button"
            onClick={() => setLayout('grid')}
            className={cn(
              'w-7 h-7 flex items-center justify-center rounded-md transition-colors',
              layout === 'grid'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={t.bucketLayoutGrid}
          >
            <Grid size={13} />
          </button>
          <button
            type="button"
            onClick={() => setLayout('list')}
            className={cn(
              'w-7 h-7 flex items-center justify-center rounded-md transition-colors',
              layout === 'list'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={t.bucketLayoutList}
          >
            <List size={13} />
          </button>
        </div>

        {selected.size > 0 && (
          <Button variant="destructive-soft" size="sm" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={12} />
            {tx('bucketDeleteSelectedCount', { count: selected.size })}
          </Button>
        )}
      </div>
    </div>

    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      titleKey="confirmDeleteFileTitle"
      descriptionKey="confirmDeleteFileDescription"
      confirmKey="confirmDeleteFileConfirm"
      vars={{ name: selected.size > 1 ? `${selected.size} elementos` : [...selected][0]?.split('/').pop() || [...selected][0] || '' }}
      onConfirm={async () => {
        await handleDelete();
        setConfirmOpen(false);
      }}
    />
    </>
  );
}
