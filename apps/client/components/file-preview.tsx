'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const isImage = IMAGE_EXTS.includes(ext);
  const isText = TEXT_EXTS.includes(ext);
  const isPdf = PDF_EXT.includes(ext);

  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  const handleLoad = () => setLoading(false);
  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <span className="text-xs text-muted-foreground shrink-0">{formatSize(fileSize)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => window.open(src, '_blank')} title="Descargar">
              <Download size={14} />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onClose} title="Cerrar">
              <X size={14} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted/30 relative min-h-[300px]">
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-muted/30">
              <Loader2 size={28} className="text-muted-foreground animate-spin" />
            </div>
          )}
          {error ? (
            <div className="text-center text-muted-foreground p-6">
              <p className="text-sm font-medium">No se puede previsualizar este archivo</p>
              <p className="text-xs mt-1">Tipo: {fileType}</p>
              <Button className="mt-4" onClick={() => window.open(src, '_blank')}>
                <Download size={14} /> Descargar
              </Button>
            </div>
          ) : isImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={src}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
                onLoad={handleLoad}
                onError={handleError}
                loading="eager"
                decoding="async"
              />
            </div>
          ) : isText || isPdf ? (
            <iframe
              src={src}
              className="w-full h-full border-0"
              title={fileName}
              onLoad={handleLoad}
              onError={handleError}
            />
          ) : (
            <div className="text-center text-muted-foreground p-6">
              <p className="text-sm font-medium">Vista previa no disponible</p>
              <p className="text-xs mt-1">Descarga el archivo para verlo</p>
              <Button className="mt-4" onClick={() => window.open(src, '_blank')}>
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
  if (!bytes) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i])}`;
}
