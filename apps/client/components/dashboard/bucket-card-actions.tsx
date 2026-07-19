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
import { useCopyJobsStore } from '@/lib/copy-jobs-store';
import { useI18n } from '@/lib/i18n';

import { BucketPermissions } from './bucket-permissions';
import { CloneBucketDialog } from './clone-bucket-dialog';
import { DeleteBucketDialog } from './delete-bucket-dialog';

interface BucketCardActionsProps {
  bucket: Bucket;
  onDeleted?: () => void;
  onCloned?: (newBucket: Bucket) => void;
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export function BucketCardActions({ bucket, onDeleted, onCloned }: BucketCardActionsProps) {
  const qc = useQueryClient();
  const { providers } = useProviders();
  const { t, tx } = useI18n();
  const addCloneJob = useCopyJobsStore((s) => s.addJob);
  const [permsOpen, setPermsOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const togglePolicy = useMutation({
    mutationFn: (isPublic: boolean) =>
      api.buckets.setPublic(bucket.name, bucket.providerId, isPublic),
    onSuccess: async (_, isPublic) => {
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      toast.success(isPublic ? t.bucketBadgePublic : t.bucketBadgePrivate);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteBucket = useMutation({
    mutationFn: () => api.buckets.delete(bucket.name, bucket.providerId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      toast.success(tx('bucketDeleteSuccess', { name: bucket.name }));
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
      addCloneJob({
        jobId: job.id,
        sourceBucket: bucket.name,
        sourceProviderId: bucket.providerId,
        destBucket: job.destBucket,
        destProviderId: job.destProviderId,
        startedAt: Date.now(),
      });
      toast.success(tx('cloneStarted', { dest: job.destBucket }));
      setCloneOpen(false);
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      onCloned?.({ ...bucket, name: job.destBucket, providerId: job.destProviderId, creationDate: undefined });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setLimit = useMutation({
    mutationFn: (limit: number) =>
      api.buckets.setLimit(bucket.name, bucket.providerId, limit, 'B'),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['buckets'] });
      await qc.invalidateQueries({ queryKey: ['buckets-stats'] });
      toast.success(t.permissionsUpdated);
      setPermsOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleOpenCloneChange = (open: boolean) => {
    setCloneOpen(open);
  };

  return (
    <div role="group" aria-label={t.bucketActionsPermissions} className="flex items-center gap-1.5" onClick={stopPropagation}>
      <Popover open={permsOpen} onOpenChange={setPermsOpen}>
        <PopoverTrigger render={<div />} nativeButton={false}>
          <Button type="button" variant="pearl" size="sm">
            <Settings size={13} />
            {t.bucketActionsPermissions}
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
        type="button"
        variant="pearl"
        size="sm"
        onClick={(e) => { stopPropagation(e); setCloneOpen(true); }}
      >
        <Copy size={13} />
        {t.bucketActionsClone}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={(e) => { stopPropagation(e); setDeleteOpen(true); }}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive-soft"
        aria-label={t.delete}
      >
        <Trash2 size={13} />
      </Button>

      <CloneBucketDialog
        bucket={bucket}
        providers={providers}
        open={cloneOpen}
        onOpenChange={handleOpenCloneChange}
        onClone={(input) => cloneBucket.mutate(input)}
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
