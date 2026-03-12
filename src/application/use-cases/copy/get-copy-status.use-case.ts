import { CopyJob } from '../../../domain/entities/copy-job.entity';
import { CopyManager } from '../../../infrastructure/copy/copy-manager';

export class GetCopyStatusUseCase {
  constructor(private copyManager: CopyManager) {}

  async execute(jobId: string): Promise<CopyJob> {
    const job = await this.copyManager.getJob(jobId);
    
    if (!job) {
      throw new Error(`Copy job ${jobId} not found`);
    }

    return job;
  }
}
