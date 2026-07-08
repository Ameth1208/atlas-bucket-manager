'use client';
import { Folder, File, Eye, Download, Film, Music, Code, Image, Check } from 'lucide-react';
import { cn, fmtBytes } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { StorageObject } from '@/lib/api';
import { useEffect } from 'react';

interface ObjectCardProps {
  obj: StorageObject;
  isSelected: boolean;
  thumbnail?: string;
  onSelect: (key: string) => void;
  onNavigate: (folder: string) => void;
  onPreview: (key: string) => void;
  onLoadThumbnail: (key: string) => void;
  onClearThumbnail: (key: string) => void;
  onDownload?: (key: string) => void;
}

function getFileType(obj: StorageObject) {
  if (obj.isFolder) return { icon: Folder, color: 'text-primary', bg: 'bg-primary/10', label: '' };
  const ext = obj.key.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'];
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'];
  const codeExts = ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'html'];
  if (imageExts.includes(ext)) return { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50', label: ext };
  if (videoExts.includes(ext)) return { icon: Film, color: 'text-purple-500', bg: 'bg-purple-50', label: ext };
  if (audioExts.includes(ext)) return { icon: Music, color: 'text-emerald-500', bg: 'bg-emerald-50', label: ext };
  if (codeExts.includes(ext)) return { icon: Code, color: 'text-amber-600', bg: 'bg-amber-50', label: ext };
  return { icon: File, color: 'text-slate-400', bg: 'bg-slate-50', label: ext };
}

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
  const { icon: Icon, color, bg, label } = getFileType(obj);
  const isImage = !obj.isFolder && /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(obj.key);


  useEffect(() => {
    if (isImage && !thumbnail) {
      onLoadThumbnail(obj.key)
    }
  }, [])

  return (
    <Card

      className={cn(
        'relative cursor-pointer select-none rounded-md border-none shadow-none transition-colors duration-150 gap-0 p-0',
        isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/30'
      )}
      onDoubleClick={() => {
        if (obj.isFolder) { onNavigate(fileName); return; }
        onSelect(obj.key);
      }}
      onClick={() => !obj.isFolder && onPreview(obj.key)}

    >
      {isSelected && (
        <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded bg-primary flex items-center justify-center z-20">
          <Check size={10} className="text-primary-foreground" />
        </div>
      )}

      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={e => { e.stopPropagation(); onPreview(obj.key); }}
          className="w-6 h-6 rounded bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <Eye size={11} className="text-white" />
        </button>
        {!obj.isFolder && onDownload && (
          <button
            onClick={e => { e.stopPropagation(); onDownload(obj.key); }}
            className="w-6 h-6 rounded bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <Download size={11} className="text-white" />
          </button>
        )}
      </div>

      <div className="h-24 flex items-center justify-center bg-linear-to-b from-muted/30 to-muted/10">
        {isImage && thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt={fileName} className="w-full h-full object-cover" loading="lazy" onError={() => onClearThumbnail(obj.key)} />
        ) : (
          <div className={cn('w-9 h-9 rounded flex items-center justify-center', bg)}>
            <Icon size={16} className={color} />
          </div>
        )}
      </div>

      <CardContent className="p-1.5 px-3 flex flex-col gap-0.5">
        <p className="text-[11px] font-medium text-foreground truncate leading-tight" title={fileName}>{fileName}</p>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">{obj.isFolder ? 'Carpeta' : fmtBytes(obj.size)}</span>
          {label && <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wide', color)}>{label}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
