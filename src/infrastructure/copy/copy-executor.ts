import { EventEmitter } from "events";
import { CopyJob } from "../../domain/entities/copy-job.entity";
import { IBucketRepository } from "../../domain/repositories/bucket.repository.interface";
import { CopyJobStore } from "./copy-job-store";

export class CopyExecutor extends EventEmitter {
  private cancelled = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;

  constructor(
    private job: CopyJob,
    private sourceRepo: IBucketRepository,
    private targetRepo: IBucketRepository,
    private jobStore: CopyJobStore,
  ) {
    super();
  }

  async start(): Promise<void> {
    this.job.status = "running";
    this.job.startedAt = new Date();
    this.startTime = Date.now();
    await this.saveJob();

    // Auto-save progress every 3 seconds
    this.updateInterval = setInterval(() => {
      this.saveJob().catch((err) => {
        console.error("Error auto-saving job:", err);
      });
    }, 3000);

    try {
      // Step 0: Create target bucket if it doesn't exist
      await this.ensureTargetBucketExists();

      // Step 1: List all objects in source bucket
      const objects = await this.listAllObjects();

      if (objects.length === 0) {
        this.job.status = "completed";
        this.job.completedAt = new Date();
        await this.cleanup();
        return;
      }

      this.job.progress.totalFiles = objects.length;
      this.job.progress.totalBytes = this.calculateTotalSize(objects);
      await this.saveJob();

      // Step 2: Copy each object
      for (let i = 0; i < objects.length; i++) {
        if (this.cancelled) {
          break;
        }

        const object = objects[i];
        this.job.progress.currentFile = object.name;

        try {
          await this.copyObject(object);
          this.job.progress.copiedFiles++;
          this.job.progress.copiedBytes += object.size;
        } catch (err: any) {
          console.error(`Error copying ${object.name}:`, err.message);
          this.job.errors.push({
            file: object.name,
            error: err.message,
            timestamp: new Date(),
          });
          this.job.progress.failedFiles++;
        }

        // Calculate speed and ETA
        this.calculateSpeedAndETA();

        // Emit progress event
        this.emit("progress", this.job);
      }

      // Mark as completed or cancelled
      this.job.status = this.cancelled ? "cancelled" : "completed";
      this.job.completedAt = new Date();
    } catch (err: any) {
      console.error("Copy job failed:", err);
      this.job.status = "failed";
      this.job.errors.push({
        file: "GENERAL",
        error: err.message,
        timestamp: new Date(),
      });
    } finally {
      await this.cleanup();
    }
  }

  private async listAllObjects(): Promise<Array<{ name: string; size: number; isFolder: boolean }>> {
    const allObjects: Array<{ name: string; size: number; isFolder: boolean }> = [];
    
    // List objects with recursive approach
    await this.listObjectsRecursive('', allObjects);
    
    return allObjects;
  }

  private async listObjectsRecursive(prefix: string, allObjects: Array<{ name: string; size: number; isFolder: boolean }>): Promise<void> {
    const result = await this.sourceRepo.listObjects(
      this.job.sourceProviderId,
      this.job.sourceBucket,
      prefix
    );

    for (const obj of result) {
      // Add folder marker for directories
      if (obj.isFolder) {
        allObjects.push({
          name: obj.name,
          size: 0,
          isFolder: true
        });
        
        // Recursively list subfolder
        await this.listObjectsRecursive(obj.name, allObjects);
      } else {
        allObjects.push({
          name: obj.name,
          size: obj.size,
          isFolder: false
        });
      }
    }
  }

  private calculateTotalSize(objects: Array<{ size: number }>): number {
    return objects.reduce((total, obj) => total + obj.size, 0);
  }

  private async ensureTargetBucketExists(): Promise<void> {
    try {
      // List all buckets to check if target exists
      const buckets = await this.targetRepo.listBuckets();
      const targetExists = buckets.some(
        (b) =>
          b.name === this.job.targetBucket &&
          b.providerId === this.job.targetProviderId,
      );

      if (!targetExists) {
        console.log(`Creating target bucket: ${this.job.targetBucket}`);
        await this.targetRepo.createBucket(
          this.job.targetProviderId,
          this.job.targetBucket,
        );
        console.log(`Target bucket created: ${this.job.targetBucket}`);
      }
    } catch (err: any) {
      console.error("Error ensuring target bucket exists:", err.message);
      throw new Error(`Failed to create target bucket: ${err.message}`);
    }
  }

  private async copyObject(object: {
    name: string;
    size: number;
    isFolder: boolean;
  }): Promise<void> {
    // If it's a folder, create it in target
    if (object.isFolder) {
      try {
        await this.targetRepo.createFolder(
          this.job.targetProviderId,
          this.job.targetBucket,
          object.name
        );
        console.log(`Created folder: ${object.name}`);
      } catch (err: any) {
        console.log(`Folder already exists or error: ${object.name}`);
      }
      return;
    }

    // Check if should skip
    if (this.job.options.skipExisting) {
      const exists = await this.targetRepo.objectExists(
        this.job.targetProviderId,
        this.job.targetBucket,
        object.name,
      );

      if (exists && !this.job.options.overwrite) {
        console.log(`Skipping existing file: ${object.name}`);
        return;
      }
    }

    // Get object stream from source
    const stream = await this.sourceRepo.getObjectStream(
      this.job.sourceProviderId,
      this.job.sourceBucket,
      object.name,
    );

    // Upload to target
    await this.targetRepo.uploadStream(
      this.job.targetProviderId,
      this.job.targetBucket,
      object.name,
      stream,
      object.size,
    );
  }

  private calculateSpeedAndETA(): void {
    const elapsedMs = Date.now() - this.startTime;
    const elapsedSec = elapsedMs / 1000;

    if (elapsedSec > 0) {
      // Speed in bytes/sec
      this.job.progress.speed = Math.round(
        this.job.progress.copiedBytes / elapsedSec,
      );

      // ETA in seconds
      const remainingBytes =
        this.job.progress.totalBytes - this.job.progress.copiedBytes;
      if (this.job.progress.speed > 0) {
        this.job.progress.eta = Math.round(
          remainingBytes / this.job.progress.speed,
        );
      }
    }
  }

  private async saveJob(): Promise<void> {
    try {
      await this.jobStore.updateJob(this.job.id, this.job);
    } catch (err) {
      console.error("Error saving job:", err);
    }
  }

  private async cleanup(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    await this.saveJob();
    this.emit("completed", this.job);

    // Auto-delete after 1 hour if completed successfully
    if (this.job.status === "completed" && this.job.errors.length === 0) {
      setTimeout(
        () => {
          this.jobStore.deleteJob(this.job.id).catch((err) => {
            console.error("Error deleting completed job:", err);
          });
        },
        60 * 60 * 1000,
      ); // 1 hour
    }
  }

  cancel(): void {
    console.log(`Cancelling job ${this.job.id}`);
    this.cancelled = true;
  }
}
