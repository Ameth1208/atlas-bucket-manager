'use client';
import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Bucket } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface DeleteBucketDialogProps {
  bucket: Bucket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteBucketDialog({ bucket, open, onOpenChange, onConfirm, isDeleting }: DeleteBucketDialogProps) {
  const { tx, t } = useI18n();
  const [typed, setTyped] = useState('');

  const matches = typed === bucket.name;
  const handleClose = () => {
    setTyped('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={18} />
            <DialogTitle>{t.confirmDeleteBucketTitle}</DialogTitle>
          </div>
          <DialogDescription>
            {tx('confirmDeleteBucketDescription', { name: bucket.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5">
          <Label className="text-[12px]">
            {t.confirmDeleteType}{' '}
            <span className="font-mono font-semibold text-foreground">{bucket.name}</span>
          </Label>
          <Input
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder={bucket.name}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && matches) onConfirm(); }}
          />
        </div>

        <DialogFooter>
          <Button variant="pearl" onClick={handleClose} disabled={isDeleting}>{t.cancel}</Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!matches || isDeleting}
          >
            {isDeleting ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {t.confirmDeleteBucketConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
