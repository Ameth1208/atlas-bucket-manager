import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { DatabaseService } from '../../infrastructure/database/database.service';
import {
  IBucketRepository,
  BUCKET_REPOSITORY,
} from '../../domain/repositories/bucket.repository';
import { CopyJob, CopyJobStatus, StartCopyInput } from '../../domain/entities/copy-job.entity';
import { ActivityService } from '../activity/activity.service';

interface CopyJobRow {
  id: string;
  actor: string | null;
  source_provider_id: string;
  source_bucket: string;
  dest_provider_id: string;
  dest_bucket: string;
  prefix: string | null;
  overwrite: number;
  status: CopyJobStatus;
  total_objects: number;
  copied_objects: number;
  total_bytes: number;
  copied_bytes: number;
  errors_json: string;
  started_at: number;
  finished_at: number | null;
}

@Injectable()
export class CopyService extends EventEmitter {
  private readonly logger = new Logger(CopyService.name);
  private jobs = new Map<string, CopyJob>();
  private workers = new Map<string, Promise<void>>();

  constructor(
    @Inject(BUCKET_REPOSITORY)
    private readonly repo: IBucketRepository,
    private readonly database: DatabaseService,
    private readonly activity: ActivityService,
  ) {
    super();
    this.hydrate();
  }

  private hydrate(): void {
    try {
      const rows = this.database.db
        .prepare(
          `SELECT * FROM copy_jobs WHERE status IN ('queued', 'running') ORDER BY started_at DESC`,
        )
        .all() as CopyJobRow[];
      for (const row of rows) {
        const job: CopyJob = this.rowToJob(row);
        this.jobs.set(job.id, job);
        if (job.status === 'running' || job.status === 'queued') {
          const worker = this.run(job).catch((err) => {
            this.logger.error(`Copy job ${job.id} failed: ${err.message}`);
          });
          this.workers.set(job.id, worker);
        }
      }
      if (rows.length) {
        this.logger.log(`Resumed ${rows.length} in-flight copy job(s) from previous run`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not hydrate copy jobs: ${err.message}`);
    }
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

  start(input: StartCopyInput, actor?: string): CopyJob {
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
    this.persist(job, actor);
    const worker = this.run(job).catch((err) => {
      this.logger.error(`Copy job ${id} failed: ${err.message}`);
    });
    this.workers.set(id, worker);
    return job;
  }

  cancel(id: string): { success: boolean } {
    const job = this.jobs.get(id);
    if (!job || job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      throw new NotFoundException('Job not running');
    }
    job.status = 'cancelled';
    job.finishedAt = Date.now();
    this.persist(job);
    this.emit('job-progress', job);
    this.workers.delete(id);
    return { success: true };
  }

  delete(id: string): { success: boolean } {
    const job = this.jobs.get(id);
    if (!job) throw new NotFoundException('Copy job not found');
    this.jobs.delete(id);
    this.workers.delete(id);
    this.database.db.prepare('DELETE FROM copy_jobs WHERE id = ?').run(id);
    return { success: true };
  }

  private async run(job: CopyJob): Promise<void> {
    if (job.status === 'cancelled') return;
    job.status = 'running';
    this.persist(job);
    this.emit('job-progress', job);

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `atlas-copy-${job.id}-`));
    const completed: string[] = [];

    try {
      const sourceClient = (this.repo as any).s3.getClient(job.sourceProviderId);
      const destClient = (this.repo as any).s3.getClient(job.destProviderId);

      const destBuckets: string[] = await destClient.listBuckets();
      if (!destBuckets.includes(job.destBucket)) {
        await destClient.makeBucket(job.destBucket, '');
      }

      const existing = new Set<string>();
      if (!job.overwrite) {
        const existingStream = destClient.listObjectsV2(job.destBucket, job.prefix ?? '', true);
        for await (const obj of existingStream) {
          if (obj.name) existing.add(obj.name);
        }
      }

      const stream = sourceClient.listObjectsV2(job.sourceBucket, job.prefix ?? '', true);
      const objects: { name: string; size: number }[] = [];
      for await (const obj of stream) {
        if (obj.name) objects.push({ name: obj.name, size: obj.size ?? 0 });
      }

      job.totalObjects = objects.length;
      job.totalBytes = objects.reduce((s, o) => s + o.size, 0);
      this.persist(job);
      this.emit('job-progress', job);

      for (const obj of objects) {
        if ((job.status as CopyJobStatus) === 'cancelled') break;
        if (!job.overwrite && existing.has(obj.name)) {
          job.errors.push({ key: obj.name, message: 'skipped (already exists)' });
          this.persist(job);
          this.emit('job-progress', job);
          continue;
        }
        const tmpPath = path.join(tmpDir, `${crypto.randomUUID()}-${path.basename(obj.name)}`);
        try {
          await sourceClient.fGetObject(job.sourceBucket, obj.name, tmpPath);
          if ((job.status as CopyJobStatus) === 'cancelled') {
            try { await fs.unlink(tmpPath); } catch { /* ignore */ }
            break;
          }
          await destClient.fPutObject(job.destBucket, obj.name, tmpPath, {});
          job.copiedObjects++;
          job.copiedBytes += obj.size;
          completed.push(tmpPath);
        } catch (err: any) {
          job.errors.push({ key: obj.name, message: err.message });
        } finally {
          try { await fs.unlink(tmpPath); } catch { /* ignore */ }
        }
        this.persist(job);
        this.emit('job-progress', job);
      }

      const realErrors = job.errors.filter((e) => !e.message.startsWith('skipped'));
      if ((job.status as CopyJobStatus) === 'cancelled') {
        job.finishedAt = Date.now();
        this.persist(job);
        this.emit('job-cancelled', job);
        this.activity.log({
          actor: this.getActor(job),
          action: 'clone',
          target: `${job.sourceBucket} → ${job.destBucket}`,
          bucket: job.destBucket,
          provider: job.destProviderId,
        });
      } else if (realErrors.length === objects.length && objects.length > 0) {
        job.status = 'failed';
        job.finishedAt = Date.now();
        this.persist(job);
        this.emit('job-failed', job);
        this.activity.log({
          actor: this.getActor(job),
          action: 'clone',
          target: `${job.sourceBucket} → ${job.destBucket} (failed)`,
          bucket: job.destBucket,
          provider: job.destProviderId,
        });
      } else {
        job.status = 'completed';
        job.finishedAt = Date.now();
        this.persist(job);
        this.emit('job-completed', job);
        this.activity.log({
          actor: this.getActor(job),
          action: 'clone',
          target: `${job.sourceBucket} → ${job.destBucket} (${job.copiedObjects} objetos)`,
          bucket: job.destBucket,
          provider: job.destProviderId,
        });
      }
    } catch (err: any) {
      job.status = 'failed';
      job.finishedAt = Date.now();
      job.errors.push({ key: '*', message: err.message });
      this.persist(job);
      this.emit('job-failed', job);
      this.activity.log({
        actor: this.getActor(job),
        action: 'clone',
        target: `${job.sourceBucket} → ${job.destBucket} (failed)`,
        bucket: job.destBucket,
        provider: job.destProviderId,
      });
    } finally {
      try {
        for (const p of completed) {
          try { await fs.unlink(p); } catch { /* ignore */ }
        }
        await fs.rmdir(tmpDir);
      } catch { /* ignore */ }
      this.workers.delete(job.id);
    }
  }

  private persist(job: CopyJob, actor?: string): void {
    this.jobs.set(job.id, job);
    this.database.db
      .prepare(
        `INSERT INTO copy_jobs (
          id, actor, source_provider_id, source_bucket,
          dest_provider_id, dest_bucket, prefix, overwrite,
          status, total_objects, copied_objects, total_bytes, copied_bytes,
          errors_json, started_at, finished_at
        ) VALUES (
          @id, @actor, @sourceProviderId, @sourceBucket,
          @destProviderId, @destBucket, @prefix, @overwrite,
          @status, @totalObjects, @copiedObjects, @totalBytes, @copiedBytes,
          @errorsJson, @startedAt, @finishedAt
        )
        ON CONFLICT(id) DO UPDATE SET
          actor = COALESCE(excluded.actor, copy_jobs.actor),
          status = excluded.status,
          total_objects = excluded.total_objects,
          copied_objects = excluded.copied_objects,
          total_bytes = excluded.total_bytes,
          copied_bytes = excluded.copied_bytes,
          errors_json = excluded.errors_json,
          finished_at = excluded.finished_at`,
      )
      .run({
        id: job.id,
        actor: actor ?? this.getActor(job),
        sourceProviderId: job.sourceProviderId,
        sourceBucket: job.sourceBucket,
        destProviderId: job.destProviderId,
        destBucket: job.destBucket,
        prefix: job.prefix ?? null,
        overwrite: job.overwrite ? 1 : 0,
        status: job.status,
        totalObjects: job.totalObjects,
        copiedObjects: job.copiedObjects,
        totalBytes: job.totalBytes,
        copiedBytes: job.copiedBytes,
        errorsJson: JSON.stringify(job.errors),
        startedAt: Math.floor(job.startedAt / 1000),
        finishedAt: job.finishedAt ? Math.floor(job.finishedAt / 1000) : null,
      });
  }

  private getActor(job: CopyJob): string {
    const row = this.database.db
      .prepare('SELECT actor FROM copy_jobs WHERE id = ?')
      .get(job.id) as { actor: string | null } | undefined;
    return row?.actor ?? 'system';
  }

  private rowToJob(row: CopyJobRow): CopyJob {
    let errors: { key: string; message: string }[] = [];
    try {
      errors = JSON.parse(row.errors_json);
    } catch {
      errors = [];
    }
    return {
      id: row.id,
      sourceProviderId: row.source_provider_id,
      sourceBucket: row.source_bucket,
      destProviderId: row.dest_provider_id,
      destBucket: row.dest_bucket,
      prefix: row.prefix ?? undefined,
      overwrite: row.overwrite === 1,
      status: row.status,
      totalObjects: row.total_objects,
      copiedObjects: row.copied_objects,
      totalBytes: row.total_bytes,
      copiedBytes: row.copied_bytes,
      errors,
      startedAt: row.started_at * 1000,
      finishedAt: row.finished_at ? row.finished_at * 1000 : undefined,
    };
  }
}
