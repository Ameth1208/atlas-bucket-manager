import { CopyJob } from '../../../domain/entities/copy-job.entity';
import { CopyManager } from '../../../infrastructure/copy/copy-manager';

export class ListCopyJobsUseCase {
  constructor(private copyManager: CopyManager) {}

  async execute(): Promise<CopyJob[]> {
    return await this.copyManager.listJobs();
  }
}
