'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn, fmtBytes } from '@/lib/utils';
import type { Bucket, CopyJob, Provider } from '@/lib/api';

interface CloneBucketDialogProps {
  bucket: Bucket;
  providers: Provider[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClone: (input: { destProviderId: string; destBucketName: string }) => void;
  job?: CopyJob | null;
  isCloning?: boolean;
}

export function CloneBucketDialog({
  bucket,
  providers,
  open,
  onOpenChange,
  onClone,
  job,
  isCloning,
}: CloneBucketDialogProps) {
  const sourceProvider = providers.find((p) => p.id === bucket.providerId);
  const [destProviderId, setDestProviderId] = useState(bucket.providerId);
  const [destBucketName, setDestBucketName] = useState('');

  useEffect(() => {
    if (open) {
      setDestProviderId(bucket.providerId);
      setDestBucketName(`${bucket.name}-copy`);
    }
  }, [open, bucket.providerId, bucket.name]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setDestBucketName(`${bucket.name}-copy`);
    }
    onOpenChange(newOpen);
  };

  const handleClone = () => {
    const name = destBucketName.trim();
    if (!name) return;
    onClone({ destProviderId, destBucketName: name });
  };

  const progressObjects = useMemo(() => {
    if (!job || job.totalObjects === 0) return 0;
    return Math.round((job.copiedObjects / job.totalObjects) * 100);
  }, [job]);

  const progressBytes = useMemo(() => {
    if (!job || job.totalBytes === 0) return 0;
    return Math.round((job.copiedBytes / job.totalBytes) * 100);
  }, [job]);

  const isJobActive = job?.status === 'queued' || job?.status === 'running';
  const isJobDone = job?.status === 'completed';
  const hasJobFailed = job?.status === 'failed' || job?.status === 'cancelled';

  const canSubmit =
    destBucketName.trim().length > 0 && !isCloning && !isJobActive && !isJobDone;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Clonar bucket</DialogTitle>
          <DialogDescription>
            Copia todos los objetos de <span className="font-medium text-foreground">{bucket.name}</span> hacia un nuevo bucket, incluso en otro proveedor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-5">
          <div className="grid gap-2.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Origen</Label>
            <div className="flex items-center gap-3 p-3 rounded-[11px] border border-border bg-muted/40">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{bucket.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {sourceProvider?.name || bucket.providerId}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2.5">
            <Label htmlFor="dest-provider" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Proveedor de destino</Label>
            <select
              id="dest-provider"
              aria-label="Proveedor de destino"
              value={destProviderId}
              onChange={(e) => setDestProviderId(e.target.value)}
              disabled={isJobActive || isJobDone || isCloning}
              className={cn(
                'w-full h-10 px-3 rounded-[11px] border border-input bg-canvas text-[14px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:opacity-50'
              )}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.id === bucket.providerId && '(actual)'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre del bucket destino</Label>
            <Input
              value={destBucketName}
              onChange={(e) => setDestBucketName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleClone()}
              placeholder="mi-bucket-clonado"
              disabled={isJobActive || isJobDone || isCloning}
              className="h-10"
            />
          </div>

          {job && (
            <div className="grid gap-3 p-4 rounded-[11px] border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{statusLabel(job.status)}</span>
                <span className={cn('text-xs font-medium', statusColor(job.status))}>
                  {job.status}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Objetos</span>
                  <span>{job.copiedObjects} / {job.totalObjects} ({progressObjects}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progressObjects}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Bytes</span>
                  <span>{fmtBytes(job.copiedBytes)} / {fmtBytes(job.totalBytes)} ({progressBytes}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progressBytes}%` }}
                  />
                </div>
              </div>

              {job.errors.length > 0 && (
                <div className="text-xs text-destructive">
                  {job.errors.length} error{job.errors.length > 1 ? 'es' : ''}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="pearl"
            onClick={() => handleOpenChange(false)}
            disabled={isJobActive || isCloning}
          >
            {isJobActive ? 'Copiando...' : 'Cancelar'}
          </Button>
          <Button onClick={handleClone} disabled={!canSubmit}>
            {isCloning ? 'Iniciando...' : isJobDone ? 'Completado' : 'Clonar bucket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function statusLabel(status: CopyJob['status']) {
  switch (status) {
    case 'queued':
      return 'En cola';
    case 'running':
      return 'Copiando';
    case 'completed':
      return 'Completado';
    case 'failed':
      return 'Falló';
    case 'cancelled':
      return 'Cancelado';
  }
}

function statusColor(status: CopyJob['status']) {
  switch (status) {
    case 'queued':
      return 'text-muted-foreground';
    case 'running':
      return 'text-blue-500';
    case 'completed':
      return 'text-emerald-500';
    case 'failed':
    case 'cancelled':
      return 'text-destructive';
  }
}
