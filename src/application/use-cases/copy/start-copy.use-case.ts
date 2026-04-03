import { CopyJob } from '../../../domain/entities/copy-job.entity';
import { CopyManager } from '../../../infrastructure/copy/copy-manager';
import { StartCopyDto } from '../../dtos/start-copy.dto';

export class StartCopyUseCase {
  constructor(private copyManager: CopyManager) {}

  async execute(dto: StartCopyDto): Promise<CopyJob> {
    // Validate inputs
    if (!dto.sourceProviderId || !dto.sourceBucket) {
      throw new Error('Source provider and bucket are required');
    }

    if (!dto.targetProviderId || !dto.targetBucket) {
      throw new Error('Target provider and bucket are required');
    }

    // Cannot copy to same bucket (unless copying a specific prefix)
    if (dto.sourceProviderId === dto.targetProviderId &&
        dto.sourceBucket === dto.targetBucket &&
        !dto.sourcePrefix) {
      throw new Error('Cannot copy bucket to itself');
    }

    // Create job
    const job = await this.copyManager.createJob({
      sourceProviderId: dto.sourceProviderId,
      sourceBucket: dto.sourceBucket,
      sourcePrefix: dto.sourcePrefix,
      targetProviderId: dto.targetProviderId,
      targetBucket: dto.targetBucket,
      options: dto.options
    });

    // Start execution
    await this.copyManager.startJob(job.id);

    return job;
  }
}
