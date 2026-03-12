import { CopyManager } from '../../../infrastructure/copy/copy-manager';

export class DeleteCopyJobUseCase {
  constructor(private copyManager: CopyManager) {}

  async execute(jobId: string): Promise<void> {
    await this.copyManager.deleteJob(jobId);
  }
}
