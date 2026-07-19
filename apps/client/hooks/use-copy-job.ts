'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CopyJob } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { isJobActive } from '@/lib/copy-jobs-store';

export function useCopyJob(jobId: string | null) {
  const qc = useQueryClient();

  const query = useQuery<CopyJob | null, Error>({
    queryKey: ['copy-job', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      return api.copy.get(jobId);
    },
    refetchInterval: (q) => {
      const data = q.state.data;
      if (!data) return false;
      if (isJobActive(data)) return 1500;
      return false;
    },
    enabled: !!jobId,
  });

  useEffect(() => {
    if (!jobId) return;

    const socket = getSocket();
    const handler = (job: CopyJob) => {
      if (!job || job.id !== jobId) return;
      qc.setQueryData(['copy-job', jobId], job);
      if (!isJobActive(job)) {
        qc.invalidateQueries({ queryKey: ['buckets'] });
      }
    };

    socket.on('copy:progress', handler);
    socket.on('copy:completed', handler);
    socket.on('copy:failed', handler);
    socket.on('copy:cancelled', handler);

    return () => {
      socket.off('copy:progress', handler);
      socket.off('copy:completed', handler);
      socket.off('copy:failed', handler);
      socket.off('copy:cancelled', handler);
    };
  }, [jobId, qc]);

  return query;
}
