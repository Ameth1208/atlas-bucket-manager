import { CopyManager } from '../../../infrastructure/copy/copy-manager';

export class CancelCopyUseCase {
  constructor(private copyManager: CopyManager) {}

  async execute(jobId: string): Promise<void> {
    const job = await this.copyManager.getJob(jobId);
    
    if (!job) {
      throw new Error(`Copy job ${jobId} not found`);
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      throw new Error(`Cannot cancel job with status: ${job.status}`);
    }

    await this.copyManager.cancelJob(jobId);
  }
}
