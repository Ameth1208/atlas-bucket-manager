'use client';
import { Folder, File, Eye, Download } from 'lucide-react';
import { cn, fmtBytes, fmtDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useBrowserStore, filteredObjects } from '../store';
import { useActionsStore } from '../store/actions';

export function ObjectList() {
  const { objects, search, filter, selected, navigate, toggleSelect } = useBrowserStore();
  const { handlePreview, handleDownload } = useActionsStore();
  const filtered = filteredObjects(objects, search, filter);

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[1fr_100px_100px_40px] gap-3 px-4 py-2.5 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <span>Nombre</span><span>Tamaño</span><span>Modificado</span><span />
      </div>
      {filtered.map((obj, i) => {
        const fileName = (obj.key ?? '').split('/').filter(Boolean).pop() || obj.key;
        const isSel = selected.has(obj.key);
        return (
          <div
            key={obj.key}
            className={cn('grid grid-cols-[1fr_100px_100px_40px] gap-3 items-center px-4 py-2.5 cursor-pointer transition-colors text-sm group', i > 0 && 'border-t border-border', isSel ? 'bg-primary/10' : 'hover:bg-muted/50')}
            onClick={() => {
              if (obj.isFolder) { navigate(fileName); return; }
              toggleSelect(obj.key);
            }}
            onDoubleClick={() => !obj.isFolder && handlePreview(obj.key)}
          >
            <div className="flex items-center gap-2 min-w-0">
              {obj.isFolder ? <Folder size={16} className="text-primary shrink-0" /> : <File size={16} className="text-muted-foreground shrink-0" />}
              <span className="text-foreground truncate">{fileName}</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{obj.isFolder ? '—' : fmtBytes(obj.size)}</span>
            <span className="text-xs text-muted-foreground">{obj.lastModified ? fmtDate(obj.lastModified) : '—'}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); handlePreview(obj.key); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground">
                <Eye size={12} />
              </button>
              <button onClick={e => { e.stopPropagation(); handleDownload(obj.key); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground">
                <Download size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
