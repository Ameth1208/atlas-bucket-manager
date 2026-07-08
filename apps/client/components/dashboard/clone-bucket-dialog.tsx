'use client';
import { useState } from 'react';
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
import type { Bucket } from '@/lib/api';

interface CloneBucketDialogProps {
  bucket: Bucket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClone: (name: string) => void;
  isCloning?: boolean;
}

export function CloneBucketDialog({
  bucket,
  open,
  onOpenChange,
  onClone,
  isCloning,
}: CloneBucketDialogProps) {
  const [cloneName, setCloneName] = useState('');

  const handleClone = () => {
    if (cloneName.trim()) {
      onClone(cloneName.trim());
      setCloneName('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setCloneName('');
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Clonar Bucket</DialogTitle>
          <DialogDescription>
            Crea una copia de "{bucket.name}" con el mismo proveedor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nombre del nuevo bucket
            </Label>
            <Input
              value={cloneName}
              onChange={e => setCloneName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleClone()}
              placeholder="mi-bucket-clonado"
              className="h-10"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleClone} 
            disabled={!cloneName.trim() || isCloning}
          >
            {isCloning ? 'Clonando...' : 'Clonar bucket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}