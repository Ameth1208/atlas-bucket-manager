'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CopyJob } from '@/lib/api';

export function useCopyJob(jobId: string | null) {
  return useQuery<CopyJob | null, Error>({
    queryKey: ['copy-job', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      return api.copy.get(jobId);
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      if (data.status === 'queued' || data.status === 'running') return 1500;
      return false;
    },
    enabled: !!jobId,
  });
}

export function useCopyProgress(jobId: string | null) {
  const { data: job } = useCopyJob(jobId);

  if (!job) {
    return {
      status: null,
      isActive: false,
      progressObjects: 0,
      progressBytes: 0,
      totalObjects: 0,
      totalBytes: 0,
      copiedObjects: 0,
      copiedBytes: 0,
      errors: [] as { key: string; message: string }[],
    };
  }

  const progressObjects = job.totalObjects > 0 ? Math.round((job.copiedObjects / job.totalObjects) * 100) : 0;
  const progressBytes = job.totalBytes > 0 ? Math.round((job.copiedBytes / job.totalBytes) * 100) : 0;

  return {
    status: job.status,
    isActive: job.status === 'queued' || job.status === 'running',
    progressObjects,
    progressBytes,
    totalObjects: job.totalObjects,
    totalBytes: job.totalBytes,
    copiedObjects: job.copiedObjects,
    copiedBytes: job.copiedBytes,
    errors: job.errors,
  };
}
