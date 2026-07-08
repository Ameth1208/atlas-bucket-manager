'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share2, Trash2, ChevronUpCircle, Copy, Settings } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import type { Bucket } from '@/lib/api';

import { BucketPermissions } from './bucket-permissions';
import { ShareBucketDialog } from './share-bucket-dialog';
import { CloneBucketDialog } from './clone-bucket-dialog';

interface BucketActionsProps {
  bucket: Bucket;
  onDeleted?: () => void;
  onCloned?: (newBucket: Bucket) => void;
  onUpload?: () => void;
}

export function BucketActions({ bucket, onDeleted, onCloned, onUpload }: BucketActionsProps) {
  const qc = useQueryClient();
  const [shareOpen, setShareOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [permsOpen, setPermsOpen] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  const togglePolicy = useMutation({
    mutationFn: (isPublic: boolean) =>
      api.buckets.setPublic(bucket.name, bucket.providerId, isPublic),
    onSuccess: async (_, isPublic) => {
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      toast.success(isPublic ? 'Bucket público' : 'Bucket privado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteBucket = useMutation({
    mutationFn: () => api.buckets.delete(bucket.name, bucket.providerId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      toast.success(`Bucket "${bucket.name}" eliminado`);
      onDeleted?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cloneBucket = useMutation({
    mutationFn: (name: string) => api.buckets.create({
      name,
      providerId: bucket.providerId,
      limit: bucket.limit,
    }),
    onSuccess: async (_result, name) => {
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      toast.success(`Bucket clonado como "${name}"`);
      setCloneOpen(false);
      onCloned?.({ ...bucket, name, creationDate: undefined });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setLimit = useMutation({
    mutationFn: (limit: number) =>
      api.buckets.setLimit(bucket.name, bucket.providerId, limit),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      toast.success('Permisos actualizados');
      setPermsOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const generateLink = async () => {
    setGeneratingLink(true);
    try {
      const { url } = await api.objects.presignedUrl(
        bucket.name,
        bucket.providerId,
        ''
      );
      setPublicLink(url.split('?')[0]);
    } catch {
      toast.error('Error generando enlace');
    } finally {
      setGeneratingLink(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-0.5">
        <Button variant="default" size="sm" onClick={onUpload} className="h-8 px-3 gap-1.5 text-xs">
          <ChevronUpCircle size={14} />
          Subir 
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCloneOpen(true)} className="h-8 px-3 gap-1.5 text-xs">
          <Copy size={13} />
          Clonar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)} className="h-8 px-3 gap-1.5 text-xs">
          <Share2 size={13} />
          Compartir
        </Button>
        <Popover open={permsOpen} onOpenChange={setPermsOpen}>
          <PopoverTrigger render={<div />} nativeButton={false}>
            <Button variant="ghost" size="sm" className="h-8 px-3 gap-1.5 text-xs">
              <Settings size={13} />
              Permisos
            </Button>
          </PopoverTrigger>
          <BucketPermissions
            bucket={bucket}
            onTogglePublic={(isPublic) => togglePolicy.mutate(isPublic)}
            onSetLimit={(limit) => setLimit.mutate(limit)}
            isTogglingPublic={togglePolicy.isPending}
            isSavingLimit={setLimit.isPending}
          />
        </Popover>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteBucket.mutate()}
          className="h-8 px-3 text-destructive hover:text-destructive gap-1.5 text-xs"
        >
          <Trash2 size={13} />
        </Button>
      </div>

      <ShareBucketDialog
        bucket={bucket}
        open={shareOpen}
        onOpenChange={setShareOpen}
        onTogglePublic={(isPublic) => togglePolicy.mutate(isPublic)}
        onGenerateLink={generateLink}
        isTogglingPublic={togglePolicy.isPending}
        isGeneratingLink={generatingLink}
        publicLink={publicLink}
      />

      <CloneBucketDialog
        bucket={bucket}
        open={cloneOpen}
        onOpenChange={setCloneOpen}
        onClone={(name) => cloneBucket.mutate(name)}
        isCloning={cloneBucket.isPending}
      />
    </>
  );
}
