export type CopyJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface CopyJobOptions {
  overwrite: boolean;
  skipExisting: boolean;
  preserveMetadata: boolean;
}

export interface CopyJobProgress {
  totalFiles: number;
  copiedFiles: number;
  failedFiles: number;
  totalBytes: number;
  copiedBytes: number;
  currentFile: string;
  speed: number; // bytes/sec
  eta: number; // seconds
}

export interface CopyJobError {
  file: string;
  error: string;
  timestamp: Date;
}

export interface CopyJob {
  id: string;
  status: CopyJobStatus;

  // Source
  sourceProviderId: string;
  sourceBucket: string;
  sourcePrefix?: string;

  // Target
  targetProviderId: string;
  targetBucket: string;

  // Options
  options: CopyJobOptions;

  // Progress
  progress: CopyJobProgress;

  // Timestamps
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  updatedAt?: Date;

  // Errors
  errors: CopyJobError[];
}
