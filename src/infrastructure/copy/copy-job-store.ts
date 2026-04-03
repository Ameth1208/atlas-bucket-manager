import fs from 'fs/promises';
import { mkdirSync } from 'fs';
import path from 'path';
import { CopyJob } from '../../domain/entities/copy-job.entity';

export class CopyJobStore {
  private jobsDir: string;

  constructor(baseDir: string = 'temp') {
    this.jobsDir = path.join(process.cwd(), baseDir, 'copy-jobs');
    try {
      mkdirSync(this.jobsDir, { recursive: true });
    } catch (err) {
      console.error('Error creating jobs directory:', err);
    }
  }

  private getJobPath(jobId: string): string {
    return path.join(this.jobsDir, `job-${jobId}.json`);
  }

  /**
   * Create a new job file
   */
  async createJob(job: CopyJob): Promise<void> {
    const jobPath = this.getJobPath(job.id);
    await fs.writeFile(jobPath, JSON.stringify(job, null, 2), 'utf-8');
  }

  /**
   * Get a job by ID
   */
  async getJob(jobId: string): Promise<CopyJob | null> {
    try {
      const jobPath = this.getJobPath(jobId);
      const data = await fs.readFile(jobPath, 'utf-8');
      const job = JSON.parse(data);
      
      // Convert date strings back to Date objects
      job.createdAt = new Date(job.createdAt);
      if (job.startedAt) job.startedAt = new Date(job.startedAt);
      if (job.completedAt) job.completedAt = new Date(job.completedAt);
      if (job.updatedAt) job.updatedAt = new Date(job.updatedAt);
      job.errors = job.errors.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));

      return job;
    } catch (err) {
      return null;
    }
  }

  /**
   * Update a job (merge updates)
   */
  async updateJob(jobId: string, updates: Partial<CopyJob>): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date()
    };

    await this.createJob(updatedJob);
  }

  /**
   * List all jobs (sorted by creation date, newest first)
   */
  async listJobs(): Promise<CopyJob[]> {
    try {
      const files = await fs.readdir(this.jobsDir);
      const jobs: CopyJob[] = [];

      for (const file of files) {
        if (file.startsWith('job-') && file.endsWith('.json')) {
          const jobId = file.replace('job-', '').replace('.json', '');
          const job = await this.getJob(jobId);
          if (job) {
            jobs.push(job);
          }
        }
      }

      return jobs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      return [];
    }
  }

  /**
   * Delete a job file
   */
  async deleteJob(jobId: string): Promise<void> {
    try {
      const jobPath = this.getJobPath(jobId);
      await fs.unlink(jobPath);
    } catch (err) {
      // Ignore if file doesn't exist
    }
  }

  /**
   * Cleanup old finished jobs (older than maxAgeHours)
   */
  async cleanupOldJobs(maxAgeHours: number = 24): Promise<number> {
    const jobs = await this.listJobs();
    const now = Date.now();
    let cleaned = 0;

    for (const job of jobs) {
      const jobAge = now - new Date(job.updatedAt || job.createdAt).getTime();
      const isOld = jobAge > maxAgeHours * 60 * 60 * 1000;
      const isFinished = ['completed', 'cancelled', 'failed'].includes(job.status);

      if (isOld && isFinished) {
        await this.deleteJob(job.id);
        cleaned++;
      }
    }

    return cleaned;
  }
}
