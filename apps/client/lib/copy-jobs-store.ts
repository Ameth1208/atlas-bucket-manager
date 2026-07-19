'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CopyJob } from './api';

export interface ActiveCloneJob {
  jobId: string;
  sourceBucket: string;
  sourceProviderId: string;
  destBucket: string;
  destProviderId: string;
  startedAt: number;
}

interface CopyJobsStore {
  jobs: ActiveCloneJob[];
  dismissed: Record<string, boolean>;
  addJob: (job: ActiveCloneJob) => void;
  removeJob: (jobId: string) => void;
  dismiss: (jobId: string) => void;
  undismiss: (jobId: string) => void;
  clearFinished: () => void;
  isDismissed: (jobId: string) => boolean;
}

export const useCopyJobsStore = create<CopyJobsStore>()(
  persist(
    (set, get) => ({
      jobs: [],
      dismissed: {},
      addJob: (job) => set((s) => ({ jobs: [job, ...s.jobs.filter((j) => j.jobId !== job.jobId)] })),
      removeJob: (jobId) =>
        set((s) => ({
          jobs: s.jobs.filter((j) => j.jobId !== jobId),
          dismissed: { ...s.dismissed, [jobId]: true },
        })),
      dismiss: (jobId) => set((s) => ({ dismissed: { ...s.dismissed, [jobId]: true } })),
      undismiss: (jobId) =>
        set((s) => {
          const next = { ...s.dismissed };
          delete next[jobId];
          return { dismissed: next };
        }),
      clearFinished: () =>
        set((s) => {
          const next: typeof s.dismissed = { ...s.dismissed };
          s.jobs.forEach((j) => {
            next[j.jobId] = true;
          });
          return { dismissed: next };
        }),
      isDismissed: (jobId) => Boolean(get().dismissed[jobId]),
    }),
    {
      name: 'atlas-copy-jobs',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : window.sessionStorage,
      ),
    },
  ),
);

export function isJobActive(job: CopyJob | null | undefined): boolean {
  return job?.status === 'queued' || job?.status === 'running';
}
