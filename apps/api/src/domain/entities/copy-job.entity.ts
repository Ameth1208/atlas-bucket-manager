export type CopyJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface CopyJob {
  id: string;
  sourceProviderId: string;
  sourceBucket: string;
  destProviderId: string;
  destBucket: string;
  prefix?: string;
  overwrite: boolean;
  status: CopyJobStatus;
  totalObjects: number;
  copiedObjects: number;
  totalBytes: number;
  copiedBytes: number;
  errors: { key: string; message: string }[];
  startedAt: number;
  finishedAt?: number;
}

export interface StartCopyInput {
  sourceProviderId: string;
  sourceBucket: string;
  destProviderId: string;
  destBucket: string;
  prefix?: string;
  overwrite?: boolean;
}
