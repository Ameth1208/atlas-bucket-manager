'use client';
import { Folder, File, Eye, Download, Film, Music, Code, Image, Trash2, FileText, Archive, FileCode, Clock } from 'lucide-react';
import { cn, fmtBytes } from '@/lib/utils';
import type { StorageObject } from '@/lib/api';
import { useEffect, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActionsStore } from '../store/actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/lib/i18n';
import NextImage from 'next/image';

interface ObjectCardProps {
  obj: StorageObject;
  isSelected: boolean;
  thumbnail?: string;
  onSelect: (key: string, opts?: { ctrl?: boolean; shift?: boolean }) => void;
  onNavigate: (folder: string) => void;
  onPreview: (key: string) => void;
  onLoadThumbnail: (key: string) => void;
  onClearThumbnail: (key: string) => void;
  onDownload?: (key: string) => void;
}

type FileKind = 'image' | 'video' | 'audio' | 'code' | 'doc' | 'archive';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'avif'];
const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'];
const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus'];
const CODE_EXTS = ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'html', 'scss', 'json', 'xml', 'yaml', 'yml', 'toml', 'sh', 'bash', 'sql'];
const DOC_EXTS = ['pdf', 'txt', 'md', 'doc', 'docx', 'rtf', 'odt', 'pages', 'csv', 'xls', 'xlsx', 'ppt', 'pptx'];
const ARCHIVE_EXTS = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz'];

function getFileKind(ext: string): FileKind {
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  if (AUDIO_EXTS.includes(ext)) return 'audio';
  if (CODE_EXTS.includes(ext)) return 'code';
  if (ARCHIVE_EXTS.includes(ext)) return 'archive';
  return 'doc';
}

const KIND_STYLE: Record<FileKind, { color: string; bg: string; icon: typeof File; label: string }> = {
  image:   { color: 'text-file-image',   bg: 'bg-file-image-soft',   icon: Image,    label: 'Imagen' },
  video:   { color: 'text-file-video',   bg: 'bg-file-video-soft',   icon: Film,     label: 'Video' },
  audio:   { color: 'text-file-audio',   bg: 'bg-file-audio-soft',   icon: Music,    label: 'Audio' },
  code:    { color: 'text-file-code',    bg: 'bg-file-code-soft',    icon: FileCode, label: 'Código' },
  doc:     { color: 'text-file-doc',     bg: 'bg-file-doc-soft',     icon: FileText, label: 'Documento' },
  archive: { color: 'text-file-archive', bg: 'bg-file-archive-soft', icon: Archive,  label: 'Archivo' },
};

const RENDERABLE_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

export function ObjectCard({
  obj,
  isSelected,
  thumbnail,
  onSelect,
  onNavigate,
  onPreview,
  onLoadThumbnail,
  onClearThumbnail,
  onDownload,
}: ObjectCardProps) {
  const fileName = (obj.key ?? '').split('/').filter(Boolean).pop() || obj.key;
  const ext = (obj.key ?? '').split('.').pop()?.toLowerCase() || '';
  const isImage = !obj.isFolder && RENDERABLE_IMAGE_EXTS.includes(ext);
  const kind = obj.isFolder ? null : getFileKind(ext);
  const style = kind ? KIND_STYLE[kind] : null;
  const IconComp = obj.isFolder ? Folder : (style?.icon ?? File);
  const { handleDeleteOne } = useActionsStore();
  const qc = useQueryClient();
  const { tx } = useI18n();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const formattedDate = useMemo(() => {
    if (!obj.lastModified) return '';
    return new Date(obj.lastModified).toLocaleDateString('es', {
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC',
    });
  }, [obj.lastModified]);

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    await handleDeleteOne(obj.key);
    qc.invalidateQueries({ queryKey: ['buckets'] });
    qc.invalidateQueries({ queryKey: ['buckets-stats'] });
    qc.invalidateQueries({ queryKey: ['file-types'] });
    setConfirmOpen(false);
  };

  useEffect(() => {
    if (isImage && !thumbnail) {
      onLoadThumbnail(obj.key);
    }
  }, [isImage, obj.key, thumbnail, onLoadThumbnail]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={obj.isFolder ? `Abrir carpeta ${fileName}` : `Seleccionar ${fileName}`}
      className={cn(
        'group relative flex flex-col bg-card border border-border rounded-md overflow-hidden cursor-pointer select-none transition-all duration-150',
        isSelected
          ? 'ring-2 ring-primary border-primary shadow-sm'
          : 'hover:border-border-strong hover:shadow-md'
      )}
      onClick={(e) => {
        onSelect(obj.key, { ctrl: e.ctrlKey || e.metaKey, shift: e.shiftKey });
      }}
      onDoubleClick={() => {
        if (obj.isFolder) { onNavigate(fileName); return; }
        onPreview(obj.key);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(obj.key, { ctrl: false, shift: false });
        }
      }}
    >
      <div className="absolute top-2.5 left-2.5 z-20">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => {
            onSelect(obj.key, { ctrl: true });
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card/90 backdrop-blur-sm border-border shadow-sm"
        />
      </div>

      <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {!obj.isFolder && (
          <>
            <ActionButton onClick={(e) => { e.stopPropagation(); onPreview(obj.key); }} ariaLabel="Vista previa">
              <Eye size={13} strokeWidth={1.8} />
            </ActionButton>
            {onDownload && (
              <ActionButton onClick={(e) => { e.stopPropagation(); onDownload(obj.key); }} ariaLabel="Descargar">
                <Download size={13} strokeWidth={1.8} />
              </ActionButton>
            )}
          </>
        )}
        <ActionButton
          onClick={onDelete}
          ariaLabel="Eliminar"
          variant="danger"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </ActionButton>
      </div>

      <div className="aspect-[4/3] flex items-center justify-center bg-muted overflow-hidden relative">
        {obj.isFolder ? (
          <div className="w-16 h-16 rounded-md bg-file-image-soft flex items-center justify-center">
            <Folder size={28} className="text-file-image" strokeWidth={1.6} />
          </div>
        ) : isImage && thumbnail ? (
          <NextImage
            src={thumbnail}
            alt={fileName}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={() => onClearThumbnail(obj.key)}
          />
        ) : (
          <div className={cn('w-16 h-16 rounded-md flex items-center justify-center', style?.bg ?? 'bg-muted')}>
            <IconComp size={28} className={style?.color ?? 'text-muted-foreground'} strokeWidth={1.6} />
          </div>
        )}

        {ext && !obj.isFolder && (
          <span className={cn(
            'absolute bottom-2 left-2 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
            style?.color,
            'bg-card/90 backdrop-blur-sm border border-border/50'
          )}>
            {ext}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3.5">
        <p className="text-[13px] font-semibold text-foreground truncate leading-tight" title={fileName}>
          {fileName}
        </p>
        <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
          <span className="tabular-nums font-mono">
            {obj.isFolder ? 'Carpeta' : fmtBytes(obj.size)}
          </span>
          {obj.lastModified && (
            <span className="flex items-center gap-1 tabular-nums">
              <Clock size={10} strokeWidth={1.8} />
              {formattedDate}
            </span>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        titleKey="confirmDeleteFileTitle"
        descriptionKey="confirmDeleteFileDescription"
        confirmKey="confirmDeleteFileConfirm"
        vars={{ name: fileName }}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}

function ActionButton({
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
        'w-7 h-7 rounded bg-card/95 backdrop-blur-sm border border-border/60 flex items-center justify-center shadow-sm transition-colors',
        variant === 'danger'
          ? 'text-muted-foreground hover:text-destructive hover:bg-destructive-soft hover:border-destructive/30'
          : 'text-muted-foreground hover:text-foreground hover:bg-card'
      )}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
