'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useProviders } from '@/hooks/use-providers';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function CreateBucketModal() {
  const qc = useQueryClient();
  const open = useAppStore(s => s.createBucketOpen);
  const close = () => useAppStore.getState().setCreateBucketOpen(false);
  const { providers } = useProviders();
  const { setBuckets } = useAppStore();

  const [name, setName] = useState('');
  const [providerId, setProviderId] = useState('');

  const createMutation = useMutation({
    mutationFn: () => api.buckets.create({ name, providerId }),
    onSuccess: (newBucket) => {
      const prev = qc.getQueryData<any[]>(['buckets']) ?? [];
      const next = [...prev, newBucket];
      qc.setQueryData(['buckets'], next);
      setBuckets(next);
      toast.success(`Bucket "${name}" creado`);
      setName(''); setProviderId('');
      close();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={close} title="Nuevo bucket">
      <div className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label>Nombre del bucket</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="mi-bucket-de-assets"
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Proveedor</Label>
          <Select value={providerId} onValueChange={(v) => setProviderId(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar proveedor" />
            </SelectTrigger>
            <SelectContent>
              {providers.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {providers.length === 0 && (
          <p className="text-xs text-orange-500">No hay proveedores configurados. Añade uno primero.</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={close}>Cancelar</Button>
          <Button
            className="flex-1"
            disabled={!name || !providerId || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending
              ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : null}
            Crear bucket
          </Button>
        </div>
      </div>
    </Modal>
  );
}
