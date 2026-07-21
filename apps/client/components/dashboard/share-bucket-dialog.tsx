'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Lock, Link, Copy, Check, RefreshCw, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import type { Bucket } from '@/lib/api';

interface ShareBucketDialogProps {
  bucket: Bucket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePublic: (isPublic: boolean) => void;
  isTogglingPublic?: boolean;
}

export function ShareBucketDialog({
  bucket,
  open,
  onOpenChange,
  onTogglePublic,
  isTogglingPublic,
}: ShareBucketDialogProps) {
  const { t, tx } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        {open && (
          <ShareBody
            key={`${bucket.providerId}:${bucket.name}:${bucket.isPublic ? 1 : 0}`}
            bucket={bucket}
            onClose={() => onOpenChange(false)}
            onTogglePublic={onTogglePublic}
            isTogglingPublic={isTogglingPublic}
            t={t}
            tx={tx}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShareBody({
  bucket,
  onClose,
  onTogglePublic,
  isTogglingPublic,
  t,
  tx,
}: {
  bucket: Bucket;
  onClose: () => void;
  onTogglePublic: (isPublic: boolean) => void;
  isTogglingPublic?: boolean;
  t: ReturnType<typeof useI18n>['t'];
  tx: ReturnType<typeof useI18n>['tx'];
}) {
  const [objectKey, setObjectKey] = useState('');
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [loadingPresign, setLoadingPresign] = useState(false);
  const [copied, setCopied] = useState<'public' | 'presign' | null>(null);

  // TanStack Query handles the lifecycle correctly: only fetches when enabled,
  // re-runs on key change, dedupes, and avoids the "setState in effect" lint rule.
  const publicQuery = useQuery({
    queryKey: ['bucket-public-endpoint', bucket.providerId, bucket.name],
    queryFn: () => api.buckets.publicEndpoint(bucket.name, bucket.providerId),
    enabled: bucket.isPublic,
    staleTime: 30_000,
  });
  const publicUrl = bucket.isPublic ? publicQuery.data?.url ?? null : null;
  const loadingEndpoint = publicQuery.isLoading && bucket.isPublic;

  const copyText = (text: string, kind: 'public' | 'presign') => {
    navigator.clipboard.writeText(text);
    setCopied(kind);
    toast.success(t.toastCopied);
    setTimeout(() => setCopied(null), 1500);
  };

  const handlePresign = async () => {
    if (!objectKey.trim()) return;
    setLoadingPresign(true);
    try {
      const { url } = await api.objects.presignedUrl(bucket.name, objectKey.trim(), bucket.providerId);
      setPresignedUrl(url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingPresign(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{tx('shareTitle', { name: bucket.name })}</DialogTitle>
        <DialogDescription>{t.shareDescription}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-5 py-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-border">
          <div className="flex items-center gap-2.5">
            {bucket.isPublic
              ? <Globe size={18} className="text-success" />
              : <Lock size={18} className="text-muted-foreground" />}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {bucket.isPublic ? t.sharePublic : t.sharePrivate}
              </span>
              <span className="text-xs text-muted-foreground">
                {bucket.isPublic ? t.sharePublicHint : t.sharePrivateHint}
              </span>
            </div>
          </div>
          <Button
            variant={bucket.isPublic ? 'destructive' : 'default'}
            size="sm"
            onClick={() => onTogglePublic(!bucket.isPublic)}
            disabled={isTogglingPublic}
          >
            {bucket.isPublic ? t.shareMakePrivate : t.shareMakePublic}
          </Button>
        </div>

        {bucket.isPublic && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t.shareLink}
            </Label>
            <div className="flex gap-2">
              <Input
                value={loadingEndpoint ? '…' : publicUrl ?? ''}
                readOnly
                placeholder={t.shareLinkPlaceholder}
                className="font-mono text-xs h-9"
              />
              <Button
                onClick={() => publicUrl && copyText(publicUrl, 'public')}
                disabled={!publicUrl}
                size="sm"
                className="h-9 w-9 p-0"
                aria-label={t.shareCopyLink}
              >
                {copied === 'public' ? <Check size={13} /> : <Copy size={13} />}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <KeyRound size={11} className="inline mr-1" />
            {t.sharePresignedLabel}
          </Label>
          <div className="flex gap-2">
            <Input
              value={objectKey}
              onChange={(e) => setObjectKey(e.target.value)}
              placeholder={t.sharePresignedPh}
              className="font-mono text-xs h-9"
            />
            <Button
              onClick={handlePresign}
              disabled={!objectKey.trim() || loadingPresign}
              size="sm"
              className="h-9 w-9 p-0"
              aria-label={t.sharePresignedGenerate}
            >
              {loadingPresign ? <RefreshCw size={13} className="animate-spin" /> : <Link size={13} />}
            </Button>
          </div>
          {presignedUrl && (
            <div className="flex gap-2 mt-1.5">
              <Input value={presignedUrl} readOnly className="font-mono text-[10px] h-8" />
              <Button
                onClick={() => copyText(presignedUrl, 'presign')}
                size="sm"
                variant="pearl"
                className="h-8 w-8 p-0"
              >
                {copied === 'presign' ? <Check size={12} /> : <Copy size={12} />}
              </Button>
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="pearl" onClick={onClose}>
          {t.shareClose}
        </Button>
      </DialogFooter>
    </>
  );
}
