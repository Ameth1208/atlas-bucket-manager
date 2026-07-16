'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Trash2, Copy } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import type { Bucket } from '@/lib/api';

import { useProviders } from '@/hooks/use-providers';
import { useCopyJob } from '@/hooks/use-copy-job';

import { BucketPermissions } from './bucket-permissions';
import { CloneBucketDialog } from './clone-bucket-dialog';
import { DeleteBucketDialog } from './delete-bucket-dialog';

interface BucketCardActionsProps {
  bucket: Bucket;
  onDeleted?: () => void;
  onCloned?: (newBucket: Bucket) => void;
}

export function BucketCardActions({ bucket, onDeleted, onCloned }: BucketCardActionsProps) {
  const qc = useQueryClient();
  const { providers } = useProviders();
  const [permsOpen, setPermsOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cloneJobId, setCloneJobId] = useState<string | null>(null);

  const { data: cloneJob } = useCopyJob(cloneJobId);

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
      setDeleteOpen(false);
      onDeleted?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cloneBucket = useMutation({
    mutationFn: ({ destProviderId, destBucketName }: { destProviderId: string; destBucketName: string }) =>
      api.copy.start({
        sourceProviderId: bucket.providerId,
        sourceBucket: bucket.name,
        destProviderId,
        destBucket: destBucketName,
      }),
    onSuccess: async (job) => {
      setCloneJobId(job.id);
      toast.success(`Clonado iniciado: ${job.destBucket}`);
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      onCloned?.({ ...bucket, name: job.destBucket, providerId: job.destProviderId, creationDate: undefined });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setLimit = useMutation({
    mutationFn: (limit: number) =>
      api.buckets.setLimit(bucket.name, bucket.providerId, limit),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      toast.success('Límite actualizado');
      setPermsOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const handleOpenCloneChange = (open: boolean) => {
    setCloneOpen(open);
    if (!open) {
      setCloneJobId(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5" onClick={stopPropagation}>
      <Popover open={permsOpen} onOpenChange={setPermsOpen}>
        <PopoverTrigger render={<div />} nativeButton={false}>
          <Button variant="pearl" size="sm">
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
        variant="pearl"
        size="sm"
        onClick={(e) => { stopPropagation(e); setCloneOpen(true); }}
      >
        <Copy size={13} />
        Clonar
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => { stopPropagation(e); setDeleteOpen(true); }}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive-soft"
        aria-label="Eliminar bucket"
      >
        <Trash2 size={13} />
      </Button>

      <CloneBucketDialog
        bucket={bucket}
        providers={providers}
        open={cloneOpen}
        onOpenChange={handleOpenCloneChange}
        onClone={(input) => cloneBucket.mutate(input)}
        job={cloneJob}
        isCloning={cloneBucket.isPending}
      />

      <DeleteBucketDialog
        bucket={bucket}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteBucket.mutate()}
        isDeleting={deleteBucket.isPending}
      />
    </div>
  );
}
