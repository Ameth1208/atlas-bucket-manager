'use client';
import { useState } from 'react';
import { Folder, File, Eye, Download, Trash2, Clock } from 'lucide-react';
import { cn, fmtBytes, fmtDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { useBrowserStore, filteredObjects } from '../store';
import { useActionsStore } from '../store/actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Checkbox } from '@/components/ui/checkbox';

export function ObjectList() {
  const { t, tx } = useI18n();
  const { objects, search, filter, selected, navigate, select } = useBrowserStore();
  const { handlePreview, handleDownload, handleDeleteOne } = useActionsStore();
  const filtered = filteredObjects(objects, search, filter);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <>
    <Card className="overflow-hidden rounded-md">
      <div className="grid grid-cols-[40px_minmax(0,1fr)_100px_120px_120px_140px] gap-4 px-5 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        <span></span>
        <span>{t.bucketListColName}</span>
        <span className="text-right">{t.bucketListColSize}</span>
        <span>{t.bucketListColModified}</span>
        <span>{t.bucketListColType}</span>
        <span className="text-right">{t.bucketListColActions}</span>
      </div>
      {filtered.map((obj, i) => {
        const fileName = (obj.key ?? '').split('/').filter(Boolean).pop() || obj.key;
        const ext = (obj.key ?? '').split('.').pop()?.toLowerCase() || '';
        const isSel = selected.has(obj.key);
        return (
          <div
            key={obj.key}
            role="button"
            tabIndex={0}
            aria-label={tx('bucketListSelectAction', { name: fileName })}
            className={cn(
              'grid grid-cols-[40px_minmax(0,1fr)_100px_120px_120px_140px] gap-4 items-center px-5 py-3 cursor-pointer transition-colors text-sm group',
              i > 0 && 'border-t border-border',
              isSel ? 'bg-primary-soft' : 'hover:bg-muted/60'
            )}
            onClick={(e) => {
              select(obj.key, { ctrl: e.ctrlKey || e.metaKey, shift: e.shiftKey });
            }}
            onDoubleClick={() => {
              if (obj.isFolder) { navigate(fileName); return; }
              handlePreview(obj.key);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select(obj.key, { ctrl: false, shift: false });
              }
            }}
          >
            <div className="flex items-center justify-center">
              <Checkbox
                checked={isSel}
                onCheckedChange={() => select(obj.key, { ctrl: true })}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
                obj.isFolder ? 'bg-file-image-soft' : 'bg-muted'
              )}>
                {obj.isFolder ? (
                  <Folder size={14} className="text-file-image" strokeWidth={1.8} />
                ) : (
                  <File size={14} className="text-muted-foreground" strokeWidth={1.8} />
                )}
              </div>
              <span className="text-foreground truncate font-medium">{fileName}</span>
            </div>
            <span className="font-mono text-[12px] text-muted-foreground text-right tabular-nums">
              {obj.isFolder ? '—' : fmtBytes(obj.size)}
            </span>
            <span className="text-[12px] text-muted-foreground tabular-nums flex items-center gap-1">
              {obj.lastModified ? (
                <>
                  <Clock size={11} strokeWidth={1.8} className="opacity-60" />
                  {fmtDate(obj.lastModified)}
                </>
              ) : '—'}
            </span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">
              {obj.isFolder ? t.bucketListFolder : (ext || '—')}
            </span>
            <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <ListAction onClick={(e) => { e.stopPropagation(); handlePreview(obj.key); }} ariaLabel={t.bucketListPreview}>
                <Eye size={13} strokeWidth={1.8} />
              </ListAction>
              <ListAction onClick={(e) => { e.stopPropagation(); handleDownload(obj.key); }} ariaLabel={t.bucketListDownload}>
                <Download size={13} strokeWidth={1.8} />
              </ListAction>
              <ListAction
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(obj.key);
                }}
                ariaLabel={t.bucketListDelete}
                variant="danger"
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </ListAction>
            </div>
          </div>
        );
      })}
    </Card>

    <ConfirmDialog
      open={!!deleteTarget}
      onOpenChange={(o) => !o && setDeleteTarget(null)}
      titleKey="confirmDeleteFileTitle"
      descriptionKey="confirmDeleteFileDescription"
      confirmKey="confirmDeleteFileConfirm"
      vars={{ name: deleteTarget ? (deleteTarget.split('/').pop() || deleteTarget) : '' }}
      onConfirm={() => {
        if (deleteTarget) {
          handleDeleteOne(deleteTarget);
          setDeleteTarget(null);
        }
      }}
    />
    </>
  );
}

function ListAction({
  children,
  onClick,
  ariaLabel,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
        variant === 'danger'
          ? 'text-muted-foreground hover:text-destructive hover:bg-destructive-soft'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
