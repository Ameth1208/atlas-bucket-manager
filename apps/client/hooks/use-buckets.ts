'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import type { Bucket } from '@/lib/api';
import { toast } from 'sonner';

export function useBuckets() {
  const { setBuckets } = useAppStore();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['buckets'],
    queryFn: async () => {
      const data = await api.buckets.list();
      setBuckets(data);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; providerId: string }) => api.buckets.create(body),
    onSuccess: async (_result, vars) => {
      const { data } = await query.refetch();
      if (data) setBuckets(data);
      qc.invalidateQueries({ queryKey: ['activity'] });
      toast.success(`Bucket "${vars.name}" creado`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ name, providerId }: { name: string; providerId: string }) =>
      api.buckets.delete(name, providerId),
    onSuccess: (_result, vars) => {
      const prev = qc.getQueryData<Bucket[]>(['buckets']) ?? [];
      const next = prev.filter(b => !(b.name === vars.name && b.providerId === vars.providerId));
      qc.setQueryData(['buckets'], next);
      setBuckets(next);
      qc.invalidateQueries({ queryKey: ['activity'] });
      toast.success(`Bucket "${vars.name}" eliminado`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    buckets: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createBucket: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteBucket: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

export function useBucketStats(bucketName: string, providerId: string) {
  return useQuery({
    queryKey: ['bucket-stats', bucketName, providerId],
    queryFn: () => api.buckets.stats(bucketName, providerId),
    enabled: !!bucketName && !!providerId,
  });
}
