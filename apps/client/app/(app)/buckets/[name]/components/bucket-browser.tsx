'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Toolbar } from '@/components/layout/toolbar';
import { BucketHeader } from '@/components/dashboard/bucket-header';

import { BucketToolbar } from './bucket-toolbar';
import { PathBreadcrumb } from './bucket-breadcrumb';
import { ObjectGrid } from './bucket-grid';
import { ObjectList } from './bucket-list';
import { SkeletonGrid } from './bucket-skeleton';
import { EmptyBucketState } from './bucket-empty-state';
import { ThumbnailErrorBanner } from './thumbnail-error-banner';
import { FilePreview } from '@/components/file-preview';
import { useBrowserStore, usePreviewStore, filteredObjects } from '../store';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import type { Bucket } from '@/lib/api';

interface BucketBrowserProps {
  bucket: Bucket;
  crumbs: { label: string; href?: string }[];
}

export function BucketBrowser({ bucket, crumbs }: BucketBrowserProps) {
  const { t } = useI18n();
  const { layout, isLoading, objects, search, filter, thumbnailError, setThumbnailError, path } = useBrowserStore();
  const { file: previewFile, set: setPreviewFile } = usePreviewStore();
  const filtered = filteredObjects(objects, search, filter);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);

  const prefix = path.join('/') + (path.length > 0 ? '/' : '');

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    const toastId = toast.loading(`Subiendo ${droppedFiles.length} archivo(s)...`);
    try {
      await api.objects.upload(bucket.name, bucket.providerId, droppedFiles, prefix);
      toast.success(t.uploadToastSuccess || '¡Subida completada con éxito!', { id: toastId });
      await useBrowserStore.getState().fetchObjects();
    } catch (err: any) {
      toast.error(err.message || 'Error al subir archivos', { id: toastId });
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex flex-col h-full overflow-hidden bg-background"
    >
      {/* ── Apple Liquid Glass Drag & Drop Overlay ── */}
      {isDraggingOver && (
        <div className="fixed inset-3 sm:inset-6 z-50 rounded-[28px] border-2 border-dashed border-[#007aff] bg-black/65 dark:bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center pointer-events-none transition-all duration-300 shadow-2xl animate-in fade-in zoom-in-95">
          <Upload size={54} strokeWidth={2} className="text-[#007aff] animate-bounce drop-shadow-[0_8px_24px_rgba(0,122,255,0.6)]" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-5">
            Suelta tus archivos para subirlos
          </h2>
          <p className="text-sm text-white/80 mt-1.5 flex items-center gap-1.5">
            Destino:
            <span className="font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/20">
              {bucket.name}{prefix ? `/${prefix}` : '/'}
            </span>
          </p>
          <p className="text-xs text-white/50 mt-3 font-medium">
            Soporta múltiples archivos y cualquier formato
          </p>
        </div>
      )}

      <div className="shrink-0 bg-background border-b border-border">
        <Toolbar crumbs={crumbs} />
        <div className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3 sm:pb-5 space-y-3 sm:space-y-5 max-w-[1600px] mx-auto w-full">
          <BucketHeader bucket={bucket} />
          <BucketToolbar />
        </div>
      </div>

      {thumbnailError && (
        <ThumbnailErrorBanner
          message={thumbnailError}
          onDismiss={() => setThumbnailError(null)}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 sm:px-6 max-w-[1600px] mx-auto w-full">
          <PathBreadcrumb />
          <div className="pt-2 pb-10">
            {isLoading ? (
              <SkeletonGrid />
            ) : filtered.length === 0 ? (
              <EmptyBucketState />
            ) : layout === 'grid' ? (
              <ObjectGrid />
            ) : (
              <ObjectList />
            )}
          </div>
        </div>
      </div>

      {previewFile && (
        <FilePreview
          src={previewFile.url}
          fileName={previewFile.name}
          fileType={previewFile.type}
          fileSize={previewFile.size}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
