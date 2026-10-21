'use client';
import { useState } from 'react';
import {
  Grid,
  List,
  Trash2,
  Search,
  X,
  Filter,
  ChevronDown,
  Check,
  Layers,
  Image,
  Film,
  Music,
  FileCode,
  FileText,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useBrowserStore } from '../store';
import { useActionsStore } from '../store/actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type FilterType = 'all' | 'image' | 'video' | 'audio' | 'code' | 'doc' | 'archive';

const FILTERS: {
  value: FilterType;
  i18nKey:
    | 'filterAll'
    | 'filterImages'
    | 'filterVideos'
    | 'filterAudio'
    | 'filterCode'
    | 'filterDocs'
    | 'filterArchives';
  icon: typeof Layers;
}[] = [
  { value: 'all', i18nKey: 'filterAll', icon: Layers },
  { value: 'image', i18nKey: 'filterImages', icon: Image },
  { value: 'video', i18nKey: 'filterVideos', icon: Film },
  { value: 'audio', i18nKey: 'filterAudio', icon: Music },
  { value: 'code', i18nKey: 'filterCode', icon: FileCode },
  { value: 'doc', i18nKey: 'filterDocs', icon: FileText },
  { value: 'archive', i18nKey: 'filterArchives', icon: Archive },
];

export function BucketToolbar() {
  const { t, tx } = useI18n();
  const { layout, setLayout, filter, setFilter, objects, selected, search, setSearch } = useBrowserStore();
  const { handleDelete } = useActionsStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterItem = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];
  const isFiltered = filter !== 'all';

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
        {/* Type Filter Popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger
            className={cn(
              'inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12px] font-medium transition-colors cursor-pointer',
              isFiltered
                ? 'border-primary/40 bg-primary-soft text-primary font-semibold'
                : 'border-border bg-card text-foreground hover:bg-muted'
            )}
            aria-label="Filtrar por tipo de archivo"
          >
            <Filter size={12} className={isFiltered ? 'text-primary' : 'text-muted-foreground'} />
            <span>{t[activeFilterItem.i18nKey]}</span>
            {isFiltered && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            )}
            <ChevronDown size={11} className="opacity-60 shrink-0" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="w-48 p-1 rounded-[14px] bg-popover/95 backdrop-blur-2xl border border-border shadow-lg"
          >
            <div className="flex flex-col gap-0.5">
              {FILTERS.map((f) => {
                const Icon = f.icon;
                const isSelected = filter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => {
                      setFilter(f.value);
                      setFilterOpen(false);
                    }}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12.5px] transition-colors text-left',
                      isSelected
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        size={13}
                        className={isSelected ? 'text-primary shrink-0' : 'text-muted-foreground shrink-0'}
                      />
                      <span className="truncate">{t[f.i18nKey]}</span>
                    </div>
                    {isSelected && <Check size={13} className="text-primary shrink-0 ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-0.5 p-1 rounded-full bg-muted/70 border border-border/70">
          <button
            type="button"
            onClick={() => setLayout('grid')}
            className={cn(
              'w-7 h-7 flex items-center justify-center rounded-full transition-all',
              layout === 'grid'
                ? 'bg-card text-foreground shadow-2xs border border-border/60'
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
              'w-7 h-7 flex items-center justify-center rounded-full transition-all',
              layout === 'list'
                ? 'bg-card text-foreground shadow-2xs border border-border/60'
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
