'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share2, Trash2, Upload, Copy, Settings, FolderPlus, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Bucket } from '@/lib/api';

import { useProviders } from '@/hooks/use-providers';
import { useCopyJobsStore } from '@/lib/copy-jobs-store';
import { useI18n } from '@/lib/i18n';

import { BucketPermissions, PermissionsBody } from './bucket-permissions';
import { ShareBucketDialog } from './share-bucket-dialog';
import { CloneBucketDialog } from './clone-bucket-dialog';
import { DeleteBucketDialog } from './delete-bucket-dialog';

interface BucketActionsProps {
  bucket: Bucket;
  onDeleted?: () => void;
  onCloned?: (newBucket: Bucket) => void;
  onUpload?: () => void;
  onNewFolder?: () => void;
}

export function BucketActions({ bucket, onDeleted, onCloned, onUpload, onNewFolder }: BucketActionsProps) {
  const qc = useQueryClient();
  const { providers } = useProviders();
  const { t, tx } = useI18n();
  const addCloneJob = useCopyJobsStore((s) => s.addJob);
  const [shareOpen, setShareOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [permsOpen, setPermsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [mobilePermsOpen, setMobilePermsOpen] = useState(false);

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
      setMobilePermsOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      {/* ── Mobile View: Compact CTA + Overflow Actions Popover ── */}
      <div className="flex md:hidden items-center gap-2 shrink-0">
        <Button
          variant="default"
          size="sm"
          onClick={onUpload}
          className="rounded-full px-3.5 h-8 text-xs bg-[#007aff] hover:bg-[#0069d9] text-white font-medium shadow-xs shrink-0 cursor-pointer"
        >
          <Upload size={13} />
          <span>{t.bucketActionsUpload}</span>
        </Button>

        <Popover open={mobileActionsOpen} onOpenChange={setMobileActionsOpen}>
          <PopoverTrigger
            aria-label="Más acciones"
            className="size-8 rounded-full flex items-center justify-center bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-all cursor-pointer shrink-0"
          >
            <MoreVertical size={15} />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="w-56 p-1.5 rounded-[16px] bg-popover/95 backdrop-blur-2xl border border-white/[0.1] shadow-xl space-y-0.5"
          >
            {onNewFolder && (
              <button
                type="button"
                onClick={() => {
                  setMobileActionsOpen(false);
                  onNewFolder();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors cursor-pointer text-left"
              >
                <FolderPlus size={14} className="text-[#007aff] shrink-0" />
                <span>{t.bucketActionsNewFolder}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileActionsOpen(false);
                setCloneOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors cursor-pointer text-left"
            >
              <Copy size={14} className="text-[#34c759] shrink-0" />
              <span>{t.bucketActionsClone}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileActionsOpen(false);
                setShareOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors cursor-pointer text-left"
            >
              <Share2 size={14} className="text-[#ff9500] shrink-0" />
              <span>{t.bucketActionsShare}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileActionsOpen(false);
                setMobilePermsOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors cursor-pointer text-left"
            >
              <Settings size={14} className="text-muted-foreground shrink-0" />
              <span>{t.bucketActionsPermissions}</span>
            </button>

            <div className="h-px bg-border/60 my-1" />

            <button
              type="button"
              onClick={() => {
                setMobileActionsOpen(false);
                setDeleteOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left"
            >
              <Trash2 size={14} className="shrink-0" />
              <span>{t.delete}</span>
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Desktop View: Full Actions Toolbar ── */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <Button variant="default" size="sm" onClick={onUpload} className="rounded-full px-3.5">
          <Upload size={13} />
          {t.bucketActionsUpload}
        </Button>
        {onNewFolder && (
          <Button variant="pearl" size="sm" onClick={onNewFolder} className="rounded-full">
            <FolderPlus size={13} />
            {t.bucketActionsNewFolder}
          </Button>
        )}
        <Button variant="pearl" size="sm" onClick={() => setCloneOpen(true)} className="rounded-full">
          <Copy size={13} />
          {t.bucketActionsClone}
        </Button>
        <Button variant="pearl" size="sm" onClick={() => setShareOpen(true)} className="rounded-full">
          <Share2 size={13} />
          {t.bucketActionsShare}
        </Button>
        <Popover open={permsOpen} onOpenChange={setPermsOpen}>
          <PopoverTrigger
            aria-label={t.bucketActionsPermissions}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium bg-muted/60 hover:bg-muted border border-border/80 text-foreground transition-all cursor-pointer"
          >
            <Settings size={13} />
            {t.bucketActionsPermissions}
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
          size="icon-sm"
          onClick={() => setDeleteOpen(true)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive-soft rounded-full"
          aria-label={t.delete}
        >
          <Trash2 size={13} />
        </Button>
      </div>

      {/* ── Dialogs ── */}
      <ShareBucketDialog
        bucket={bucket}
        open={shareOpen}
        onOpenChange={setShareOpen}
        onTogglePublic={(isPublic) => togglePolicy.mutate(isPublic)}
        isTogglingPublic={togglePolicy.isPending}
      />

      <CloneBucketDialog
        bucket={bucket}
        providers={providers}
        open={cloneOpen}
        onOpenChange={setCloneOpen}
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

      {/* ── Mobile Permissions Dialog ── */}
      <Dialog open={mobilePermsOpen} onOpenChange={setMobilePermsOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[20px] bg-card/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl">
          <PermissionsBody
            key={`mobile:${bucket.providerId}:${bucket.name}:${bucket.limit ?? 'none'}`}
            initialLimit={bucket.limit ?? 0}
            isPublic={bucket.isPublic ?? false}
            onTogglePublic={(isPublic) => togglePolicy.mutate(isPublic)}
            onSetLimit={(limit) => setLimit.mutate(limit)}
            isTogglingPublic={togglePolicy.isPending}
            isSavingLimit={setLimit.isPending}
            t={t}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
