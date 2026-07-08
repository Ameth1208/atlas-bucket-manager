'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import type { Provider } from '@/lib/api';
import { toast } from 'sonner';

export function useProviders() {
  const { setProviders } = useAppStore();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const data = await api.buckets.providers();
      setProviders(data);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: api.buckets.createProvider,
    onSuccess: (newProvider: Provider) => {
      const prev = qc.getQueryData<Provider[]>(['providers']) ?? [];
      const next = [...prev, newProvider];
      qc.setQueryData(['providers'], next);
      setProviders(next);
      qc.invalidateQueries({ queryKey: ['activity'] });
      toast.success(`Proveedor "${newProvider.name}" conectado`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    providers: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createProvider: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
