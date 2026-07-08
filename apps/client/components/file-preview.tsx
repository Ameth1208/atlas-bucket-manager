'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';


interface FilePreviewProps {
  src: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  onClose: () => void;
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
const TEXT_EXTS = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'sh', 'yaml', 'yml', 'toml', 'ini', 'conf', 'log'];
const PDF_EXT = ['pdf'];

export function FilePreview({ src, fileName, fileType, fileSize, onClose }: FilePreviewProps) {
  const [error, setError] = useState(false);
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const isImage = IMAGE_EXTS.includes(ext);
  const isText = TEXT_EXTS.includes(ext);
  const isPdf = PDF_EXT.includes(ext);

  return (
    <Dialog open={true} onOpenChange={() => onClose()} >
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <span className="text-xs text-muted-foreground shrink-0">{formatSize(fileSize)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => window.open(src, '_blank')}>
              <Download size={14} />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X size={14} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/5">
          {error ? (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No se puede previsualizar este archivo</p>
              <p className="text-xs mt-1">Tipo: {fileType}</p>
            </div>
          ) : isImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
                onError={() => setError(true)}
              />
            </div>
          ) : isText ? (
            <iframe
              src={src}
              className="w-full h-full border-0"
              title={fileName}
              onError={() => setError(true)}
            />
          ) : isPdf ? (
            <iframe
              src={src}
              className="w-full h-full border-0"
              title={fileName}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Vista previa no disponible</p>
              <p className="text-xs mt-1">Descarga el archivo para verlo</p>
              <Button className="mt-3" onClick={() => window.open(src, '_blank')}>
                <Download size={14} /> Descargar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatSize(bytes: number): string {
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i])}`;
}
