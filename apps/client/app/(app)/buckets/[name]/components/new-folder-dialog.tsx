'use client';
import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
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
import { api } from '@/lib/api';
import { useURLStore } from '../store/url';
import { useBrowserStore } from '../store/browser';
import { useBucketUIStore } from '../store/ui';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewFolderDialog({ open, onOpenChange }: NewFolderDialogProps) {
  const { bucketName, providerId } = useURLStore();
  const { path, fetchObjects } = useBrowserStore();
  const newFolderName = useBucketUIStore(s => s.newFolderName);
  const setNewFolderName = useBucketUIStore(s => s.setNewFolderName);
  const { t, tx } = useI18n();
  const [touched, setTouched] = useState(false);

  const prefix = path.join('/') + (path.length > 0 ? '/' : '');

  const mutation = useMutation({
    mutationFn: () => api.objects.createFolder(bucketName, providerId, newFolderName.trim(), prefix),
    onSuccess: () => {
      toast.success(tx('folderNewCreated', { name: newFolderName.trim() }));
      setNewFolderName('');
      setTouched(false);
      onOpenChange(false);
      fetchObjects();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleClose = () => {
    setNewFolderName('');
    setTouched(false);
    onOpenChange(false);
  };

  const valid = /^[a-zA-Z0-9._\- ]{1,255}$/.test(newFolderName.trim());
  const canSubmit = valid && !mutation.isPending;

  const description = path.length
    ? tx('folderNewDescription', { path: path.join(' / ') + ' /' })
    : t.folderNewDescriptionRoot;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{t.folderNewTitle}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5">
          <Label>{t.folderNewName}</Label>
          <Input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onBlur={() => setTouched(true)}
            invalid={touched && !valid}
            placeholder={t.folderNewNamePh}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && canSubmit) mutation.mutate(); }}
          />
          {touched && !valid && (
            <p className="text-[11px] text-destructive">
              {t.folderNewInvalid}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="pearl" onClick={handleClose}>{t.cancel}</Button>
          <Button onClick={() => { setTouched(true); if (canSubmit) mutation.mutate(); }} disabled={!canSubmit}>
            {mutation.isPending ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <FolderPlus size={14} />
            )}
            {t.folderCreate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
