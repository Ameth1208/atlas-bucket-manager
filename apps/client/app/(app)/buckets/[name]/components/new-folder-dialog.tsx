'use client';
import { useState } from 'react';
import { FolderPlus, Check } from 'lucide-react';
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
  const [touched, setTouched] = useState(false);

  const prefix = path.join('/') + (path.length > 0 ? '/' : '');

  const mutation = useMutation({
    mutationFn: () => api.objects.createFolder(bucketName, providerId, newFolderName.trim(), prefix),
    onSuccess: () => {
      toast.success(`Carpeta "${newFolderName.trim()}" creada`);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Nueva carpeta</DialogTitle>
          <DialogDescription>
            Crea una carpeta dentro de {path.length ? path.join(' / ') + ' /' : 'la raíz del bucket'}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5">
          <Label>Nombre</Label>
          <Input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onBlur={() => setTouched(true)}
            invalid={touched && !valid}
            placeholder="mi-carpeta"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && canSubmit) mutation.mutate(); }}
          />
          {touched && !valid && (
            <p className="text-[11px] text-destructive">
              Solo letras, números, espacios, puntos, guiones y guiones bajos (1-255 caracteres).
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="pearl" onClick={handleClose}>Cancelar</Button>
          <Button onClick={() => { setTouched(true); if (canSubmit) mutation.mutate(); }} disabled={!canSubmit}>
            {mutation.isPending ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <FolderPlus size={14} />
            )}
            Crear carpeta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
