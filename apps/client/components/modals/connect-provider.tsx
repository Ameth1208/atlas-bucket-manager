'use client';
import { ProviderFormModal } from './provider-form';
import { useAppStore } from '@/lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Provider } from '@/lib/api';

export function ConnectProviderModal() {
  const open = useAppStore(s => s.connectProviderOpen);
  const setOpen = useAppStore(s => s.setConnectProviderOpen);
  const qc = useQueryClient();

  return (
    <ProviderFormModal
      open={open}
      mode="create"
      onClose={() => setOpen(false)}
      onSuccess={(p: Provider) => {
        qc.invalidateQueries({ queryKey: ['providers'] });
        qc.invalidateQueries({ queryKey: ['buckets'] });
        qc.invalidateQueries({ queryKey: ['activity'] });
        toast.success(`Proveedor "${p.name}" conectado`);
      }}
    />
  );
}

export function EditProviderModal() {
  const editProviderId = useAppStore(s => s.editProviderId);
  const setEditProviderId = useAppStore(s => s.setEditProviderId);
  const qc = useQueryClient();

  const provider = editProviderId
    ? qc.getQueryData<Provider[]>(['providers'])?.find(p => p.id === editProviderId) ?? null
    : null;

  return (
    <ProviderFormModal
      open={!!editProviderId}
      mode="edit"
      provider={provider}
      onClose={() => setEditProviderId(null)}
      onSuccess={(p: Provider) => {
        const prev = qc.getQueryData<Provider[]>(['providers']) ?? [];
        const next = prev.map(x => (x.id === p.id ? p : x));
        qc.setQueryData(['providers'], next);
        qc.invalidateQueries({ queryKey: ['buckets'] });
        qc.invalidateQueries({ queryKey: ['activity'] });
        toast.success(`Proveedor "${p.name}" actualizado`);
      }}
    />
  );
}
