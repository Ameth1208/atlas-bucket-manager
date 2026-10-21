'use client';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Loader2, Share2, Check } from 'lucide-react';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

interface FilePreviewProps {
  src: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  shareUrl?: string;
  onClose: () => void;
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'];
const TEXT_EXTS = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'sh', 'yaml', 'yml', 'toml', 'ini', 'conf', 'log', 'csv'];
const PDF_EXT = ['pdf'];

export function FilePreview(props: FilePreviewProps) {
  return <FilePreviewInner key={props.src} {...props} />;
}

function FilePreviewInner({ src, fileName, fileType, fileSize, shareUrl, onClose }: FilePreviewProps) {
  const { t, tx } = useI18n();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const isImage = IMAGE_EXTS.includes(ext);
  const isText = TEXT_EXTS.includes(ext);
  const isPdf = PDF_EXT.includes(ext);

  const handleLoad = () => setLoading(false);
  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const downloadUrl = src.includes('?') ? `${src}&download=1` : `${src}?download=1`;

  const handleShare = async () => {
    const urlToCopy = shareUrl || (typeof window !== 'undefined' ? `${window.location.origin}${src}` : src);
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast.success('Enlace público copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent
        className="w-[94vw] max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="flex flex-row items-center justify-between px-5 py-3 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{fileName}</p>
            <span className="text-xs text-muted-foreground shrink-0 font-mono tabular-nums">
              {formatSize(fileSize)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShare}
              title="Compartir enlace público"
              className="text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => window.open(downloadUrl, '_blank')}
              title={t.filePreviewDownload}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              title={t.filePreviewClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-muted/20 relative">
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-card/60 backdrop-blur-xs">
              <Loader2 size={32} className="text-muted-foreground animate-spin" />
            </div>
          )}
          {error ? (
            <div className="text-center text-muted-foreground p-6 max-w-md">
              <p className="text-sm font-semibold text-foreground">{t.filePreviewCannotPreview}</p>
              <p className="text-xs mt-1 text-muted-foreground">{tx('filePreviewType', { type: fileType })}</p>
              <Button className="mt-4" onClick={() => window.open(downloadUrl, '_blank')}>
                <Download size={14} /> {t.filePreviewDownload}
              </Button>
            </div>
          ) : isImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-6">
              <Image
                src={src}
                alt={fileName}
                fill
                unoptimized
                priority
                sizes="90vw"
                className="object-contain max-h-full max-w-full select-none"
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          ) : isText || isPdf ? (
            <iframe
              src={src}
              className="w-full h-full border-0 bg-background"
              title={fileName}
              sandbox="allow-scripts allow-same-origin"
              onLoad={handleLoad}
              onError={handleError}
            />
          ) : (
            <div className="text-center text-muted-foreground p-6 max-w-md">
              <p className="text-sm font-semibold text-foreground">{t.filePreviewNotAvailable}</p>
              <p className="text-xs mt-1 text-muted-foreground">{t.filePreviewDownloadToView}</p>
              <Button className="mt-4" onClick={() => window.open(downloadUrl, '_blank')}>
                <Download size={14} /> {t.filePreviewDownload}
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
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
