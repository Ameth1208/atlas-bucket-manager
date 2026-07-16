'use client';
import { useCallback, useState } from 'react';
import { Upload, X, File as FileIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useURLStore } from '@/app/(app)/buckets/[name]/store/url';
import { useBrowserStore } from '@/app/(app)/buckets/[name]/store/browser';
import { toast } from 'sonner';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FileItem {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

const toPendingItems = (files: File[]): FileItem[] =>
  files.map(file => ({ file, status: 'pending' }));

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { bucketName, providerId } = useURLStore();
  const { path } = useBrowserStore();

  const uploadMutation = useMutation({
    mutationFn: async (fileItems: FileItem[]) => {
      const pendingFiles = fileItems.filter(f => f.status === 'pending');
      const prefix = path.join('/') + (path.length > 0 ? '/' : '');

      setFiles(prev => prev.map(f => pendingFiles.some(p => p.file === f.file) ? { ...f, status: 'uploading' } : f));
      await Promise.all(pendingFiles.map(async (item) => {
        try {
          await api.objects.upload(bucketName, providerId, [item.file], prefix);
          setFiles(prev => prev.map(f => f.file === item.file ? { ...f, status: 'done' } : f));
        } catch {
          setFiles(prev => prev.map(f => f.file === item.file ? { ...f, status: 'error' } : f));
        }
      }));
    },
    onSuccess: () => {
      toast.success('Archivos subidos');
      useBrowserStore.getState().fetchObjects();
      setFiles([]);
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...toPendingItems(droppedFiles)]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...toPendingItems(selectedFiles)]);
  };

  const handleRemove = (file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  };

  const handleUpload = () => {
    if (files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

  const handleClose = () => {
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Subir archivos</DialogTitle>
          <DialogDescription>
            Arrastra archivos aquí o haz clic para seleccionar
          </DialogDescription>
        </DialogHeader>

        <div
          role="button"
          tabIndex={0}
          aria-label="Seleccionar archivos para subir"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('upload-file-input')?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('upload-file-input')?.click();
            }
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-3 py-10 px-4 rounded-2xl border-2 border-dashed transition-colors cursor-pointer',
            isDragging
              ? 'border-foreground bg-muted'
              : 'border-border hover:border-foreground/30 hover:bg-muted/30'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Upload size={20} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Arrastra archivos aquí</p>
            <p className="text-xs text-muted-foreground mt-0.5">o haz clic para buscar</p>
          </div>
          <input 
            id="upload-file-input" 
            type="file" 
            multiple 
            aria-label="Archivos para subir"
            className="hidden" 
            onChange={handleFileSelect}
          />
        </div>

        {files.length > 0 && (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto py-2">
            {files.map((item) => (
              <div 
                key={item.file.name}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/50 group"
              >
                <FileIcon size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs font-medium truncate flex-1">{item.file.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {(item.file.size / 1024).toFixed(1)} KB
                </span>
                {item.status === 'done' && (
                  <CheckCircle2 size={14} className="text-success shrink-0" />
                )}
                {item.status === 'uploading' && (
                  <Loader2 size={14} className="text-foreground animate-spin shrink-0" />
                )}
                {item.status === 'error' && (
                  <span className="text-[10px] text-destructive">Error</span>
                )}
                {item.status === 'pending' && (
                  <button
                    type="button"
                    aria-label={`Eliminar ${item.file.name}`}
                    onClick={() => handleRemove(item.file)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="pearl" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Subiendo...' : `Subir ${files.length > 0 ? `(${files.length})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
