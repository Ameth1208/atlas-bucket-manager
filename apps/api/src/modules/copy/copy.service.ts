import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import {
  IBucketRepository,
  BUCKET_REPOSITORY,
} from '../../domain/repositories/bucket.repository';
import { CopyJob, CopyJobStatus, StartCopyInput } from '../../domain/entities/copy-job.entity';

@Injectable()
export class CopyService extends EventEmitter {
  private readonly logger = new Logger(CopyService.name);
  private jobs = new Map<string, CopyJob>();

  constructor(
    @Inject(BUCKET_REPOSITORY)
    private readonly repo: IBucketRepository,
  ) {
    super();
  }

  list(): CopyJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.startedAt - a.startedAt,
    );
  }

  get(id: string): CopyJob {
    const job = this.jobs.get(id);
    if (!job) throw new NotFoundException('Copy job not found');
    return job;
  }

  start(input: StartCopyInput): CopyJob {
    const id = crypto.randomUUID();
    const job: CopyJob = {
      id,
      sourceProviderId: input.sourceProviderId,
      sourceBucket: input.sourceBucket,
      destProviderId: input.destProviderId,
      destBucket: input.destBucket,
      prefix: input.prefix,
      overwrite: input.overwrite ?? false,
      status: 'queued',
      totalObjects: 0,
      copiedObjects: 0,
      totalBytes: 0,
      copiedBytes: 0,
      errors: [],
      startedAt: Date.now(),
    };
    this.jobs.set(id, job);
    this.run(job).catch((err) => {
      this.logger.error(`Copy job ${id} failed: ${err.message}`, err.stack);
    });
    return job;
  }

  cancel(id: string): { success: boolean } {
    const job = this.jobs.get(id);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      throw new NotFoundException('Job not running');
    }
    job.status = 'cancelled';
    job.finishedAt = Date.now();
    this.emit('job-completed', job);
    return { success: true };
  }

  delete(id: string): { success: boolean } {
    const job = this.jobs.get(id);
    if (!job) throw new NotFoundException('Copy job not found');
    this.jobs.delete(id);
    return { success: true };
  }

  private async run(job: CopyJob): Promise<void> {
    job.status = 'running';
    this.emit('job-progress', job);

    try {
      const sourceClient = (this.repo as any).s3.getClient(job.sourceProviderId);
      const destClient = (this.repo as any).s3.getClient(job.destProviderId);

      // Ensure dest bucket exists
      const destBuckets: string[] = await destClient.listBuckets();
      if (!destBuckets.includes(job.destBucket)) {
        await destClient.makeBucket(job.destBucket, '');
      }

      const stream = sourceClient.listObjectsV2(job.sourceBucket, job.prefix ?? '', true);
      const objects: { name: string; size: number }[] = [];
      for await (const obj of stream) {
        if (obj.name) {
          objects.push({ name: obj.name, size: obj.size ?? 0 });
        }
      }

      job.totalObjects = objects.length;
      job.totalBytes = objects.reduce((s, o) => s + o.size, 0);

      for (const obj of objects) {
        if ((job.status as CopyJobStatus) === 'cancelled') return;
        try {
          await sourceClient.fGetObject(job.sourceBucket, obj.name, '/tmp/copy-tmp');
          await destClient.fPutObject(job.destBucket, obj.name, '/tmp/copy-tmp', {});
          job.copiedObjects++;
          job.copiedBytes += obj.size;
        } catch (err: any) {
          job.errors.push({ key: obj.name, message: err.message });
        }
        this.emit('job-progress', job);
      }

      job.status = job.errors.length === objects.length && objects.length > 0 ? 'failed' : 'completed';
      job.finishedAt = Date.now();
      this.emit('job-completed', job);
    } catch (err: any) {
      job.status = 'failed';
      job.finishedAt = Date.now();
      job.errors.push({ key: '*', message: err.message });
      this.emit('job-completed', job);
    }
  }
}
