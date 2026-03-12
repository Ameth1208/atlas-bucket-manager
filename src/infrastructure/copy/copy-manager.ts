import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { CopyJob, CopyJobOptions } from '../../domain/entities/copy-job.entity';
import { IBucketRepository } from '../../domain/repositories/bucket.repository.interface';
import { CopyJobStore } from './copy-job-store';
import { CopyExecutor } from './copy-executor';

export interface StartCopyParams {
  sourceProviderId: string;
  sourceBucket: string;
  targetProviderId: string;
  targetBucket: string;
  options: CopyJobOptions;
}

export class CopyManager extends EventEmitter {
  private activeExecutors = new Map<string, CopyExecutor>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private jobStore: CopyJobStore,
    private bucketRepository: IBucketRepository
  ) {
    super();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Create jobs directory
    await this.jobStore['ensureJobsDir']();

    // Start cleanup scheduler (every hour)
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldJobs();
    }, 60 * 60 * 1000);

    // Resume any running jobs on startup
    await this.resumeRunningJobs();
  }

  private async resumeRunningJobs(): Promise<void> {
    const jobs = await this.jobStore.listJobs();
    
    for (const job of jobs) {
      if (job.status === 'running') {
        console.log(`Resuming job ${job.id} after restart`);
        // Mark as queued to restart
        job.status = 'queued';
        await this.jobStore.updateJob(job.id, job);
        await this.startJob(job.id);
      }
    }
  }

  async createJob(params: StartCopyParams): Promise<CopyJob> {
    const job: CopyJob = {
      id: uuidv4(),
      status: 'queued',
      sourceProviderId: params.sourceProviderId,
      sourceBucket: params.sourceBucket,
      targetProviderId: params.targetProviderId,
      targetBucket: params.targetBucket,
      options: params.options,
      progress: {
        totalFiles: 0,
        copiedFiles: 0,
        failedFiles: 0,
        totalBytes: 0,
        copiedBytes: 0,
        currentFile: '',
        speed: 0,
        eta: 0
      },
      createdAt: new Date(),
      errors: []
    };

    await this.jobStore.createJob(job);
    return job;
  }

  async startJob(jobId: string): Promise<void> {
    const job = await this.jobStore.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (this.activeExecutors.has(jobId)) {
      throw new Error(`Job ${jobId} is already running`);
    }

    // Create repositories for source and target
    const sourceRepo = this.bucketRepository;
    const targetRepo = this.bucketRepository;

    // Create executor
    const executor = new CopyExecutor(job, sourceRepo, targetRepo, this.jobStore);

    // Listen to executor events
    executor.on('progress', (updatedJob: CopyJob) => {
      this.emit('job-progress', updatedJob);
    });

    executor.on('completed', (completedJob: CopyJob) => {
      this.activeExecutors.delete(jobId);
      this.emit('job-completed', completedJob);
    });

    // Store executor reference
    this.activeExecutors.set(jobId, executor);

    // Start execution in background
    executor.start().catch(err => {
      console.error(`Job ${jobId} failed:`, err);
      this.activeExecutors.delete(jobId);
    });
  }

  async getJob(jobId: string): Promise<CopyJob | null> {
    return await this.jobStore.getJob(jobId);
  }

  async listJobs(): Promise<CopyJob[]> {
    return await this.jobStore.listJobs();
  }

  async cancelJob(jobId: string): Promise<void> {
    const executor = this.activeExecutors.get(jobId);
    if (executor) {
      executor.cancel();
    } else {
      // Job not running, just mark as cancelled
      const job = await this.jobStore.getJob(jobId);
      if (job && job.status === 'queued') {
        job.status = 'cancelled';
        await this.jobStore.updateJob(jobId, job);
      }
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    // Cancel if running
    const executor = this.activeExecutors.get(jobId);
    if (executor) {
      executor.cancel();
      this.activeExecutors.delete(jobId);
    }

    // Delete from storage
    await this.jobStore.deleteJob(jobId);
  }

  private async cleanupOldJobs(): Promise<void> {
    try {
      const cleaned = await this.jobStore.cleanupOldJobs(24);
      if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} old copy jobs`);
      }
    } catch (err) {
      console.error('Error cleaning up old jobs:', err);
    }
  }

  destroy(): void {
    // Stop cleanup scheduler
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Cancel all active executors
    for (const [jobId, executor] of this.activeExecutors.entries()) {
      executor.cancel();
      this.activeExecutors.delete(jobId);
    }
  }
}
