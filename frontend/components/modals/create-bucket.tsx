'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function CreateBucketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [providerId, setProviderId] = useState('');

  const { data: providers = [] } = useQuery({ queryKey: ['providers'], queryFn: api.buckets.providers, enabled: open });

  const createMutation = useMutation({
    mutationFn: () => api.buckets.create({ name, providerId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['buckets'] });
      toast.success(`Bucket "${name}" creado`);
      setName(''); setProviderId('');
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title="Nuevo bucket">
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
          <select
            value={providerId}
            onChange={e => setProviderId(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none focus:border-ring transition-colors"
          >
            <option value="">Seleccionar proveedor</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {providers.length === 0 && (
          <p className="text-xs text-orange-500">No hay proveedores configurados. Añade uno primero.</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
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
