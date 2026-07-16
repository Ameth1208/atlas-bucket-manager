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
