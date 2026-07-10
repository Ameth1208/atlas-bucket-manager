'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import type { Bucket, BucketsListResult, ProviderListError } from '@/lib/api';
import { toast } from 'sonner';

export function useBuckets() {
  const { setBuckets } = useAppStore();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['buckets'],
    queryFn: async (): Promise<BucketsListResult> => {
      const data = await api.buckets.list();
      setBuckets(data.buckets);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; providerId: string }) => api.buckets.create(body),
    onSuccess: async (_result, vars) => {
      await query.refetch();
      qc.invalidateQueries({ queryKey: ['activity'] });
      toast.success(`Bucket "${vars.name}" creado`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ name, providerId }: { name: string; providerId: string }) =>
      api.buckets.delete(name, providerId),
    onSuccess: async (_result, vars) => {
      await query.refetch();
      qc.invalidateQueries({ queryKey: ['activity'] });
      toast.success(`Bucket "${vars.name}" eliminado`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    buckets: query.data?.buckets ?? [],
    providerErrors: query.data?.providerErrors ?? [],
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
