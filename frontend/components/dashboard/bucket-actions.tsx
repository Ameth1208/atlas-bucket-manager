'use client';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share2, Trash2, Upload, Key, Globe, Lock, Link, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Bucket } from '@/lib/api';

interface BucketActionsProps {
  bucket: Bucket;
  onDeleted?: () => void;
}

export function BucketActions({ bucket, onDeleted }: BucketActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  const togglePolicy = useMutation({
    mutationFn: (isPublic: boolean) =>
      api.buckets.setPublic(bucket.name, bucket.providerId, isPublic),
    onSuccess: (_, isPublic) => {
      toast.success(isPublic ? 'Bucket público' : 'Bucket privado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteBucket = useMutation({
    mutationFn: () => api.buckets.delete(bucket.name, bucket.providerId),
    onSuccess: () => {
      toast.success(`Bucket "${bucket.name}" eliminado`);
      onDeleted?.();
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
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
          <Share2 size={13} />
          Compartir
        </Button>
        <Button variant="outline" size="sm" onClick={() => togglePolicy.mutate(!bucket.isPublic)}>
          {bucket.isPublic ? <Globe size={13} /> : <Lock size={13} />}
          {bucket.isPublic ? 'Hacer privado' : 'Hacer público'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => deleteBucket.mutate()}>
          <Trash2 size={13} />
        </Button>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Compartir "{bucket.name}"</DialogTitle>
            <DialogDescription>Configura los permisos y enlaces de acceso.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {bucket.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                <span className="text-sm font-medium">
                  {bucket.isPublic ? 'Público' : 'Privado'}
                </span>
              </div>
              <Button
                variant={bucket.isPublic ? 'secondary' : 'default'}
                size="sm"
                onClick={() => togglePolicy.mutate(!bucket.isPublic)}
              >
                {bucket.isPublic ? 'Hacer privado' : 'Hacer público'}
              </Button>
            </div>

            <div className="border-t border-border" />

            <div className="grid gap-2">
              <Label>Enlace público</Label>
              <div className="flex gap-2">
                <Input value={publicLink} readOnly placeholder="Genera un enlace para compartir" className="font-mono text-xs" />
                <Button onClick={generateLink} disabled={generatingLink} size="sm">
                  {generatingLink ? <RefreshCw size={13} className="animate-spin" /> : <Link size={13} />}
                </Button>
              </div>
              {publicLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-1"
                  onClick={() => navigator.clipboard.writeText(publicLink)}
                >
                  Copiar enlace
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
