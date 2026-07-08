'use client';
import { Grid, List, Trash2, Files } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBrowserStore } from '../store';
import { useActionsStore } from '../store/actions';

type Filter = 'all' | 'image' | 'video' | 'audio' | 'code';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'image', label: 'Imágenes' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'code', label: 'Código' },
];

export function BucketToolbar() {
  const { layout, setLayout, filter, setFilter, objects, selected } = useBrowserStore();
  const { handleDelete } = useActionsStore();

  return (
    <div className="w-full flex items-center justify-between mb-6">
      <div className="flex justify-center items-center gap-2 text-xl font-bold text-foreground">
        <span>Archivos</span>
        <span className="px-4 py-1 rounded-full font-bold text-xs bg-muted-foreground/10  text-muted-foreground">{objects.length}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
                filter === f.value 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border">
          <button 
            onClick={() => setLayout('grid')} 
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-md transition-all duration-150',
              layout === 'grid' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Grid size={14} />
          </button>
          <button 
            onClick={() => setLayout('list')} 
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-md transition-all duration-150',
              layout === 'list' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List size={14} />
          </button>
        </div>

        {selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleDelete} className="h-8 px-3 gap-1.5 text-xs">
            <Trash2 size={12} /> 
            <span>Eliminar ({selected.size})</span>
          </Button>
        )}
      </div>
    </div>
  );
}