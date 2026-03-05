import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';
import { BucketStats } from '../../../domain/entities/bucket.entity';

export class GetBucketStatsUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(providerId: string, bucketName: string): Promise<BucketStats> {
    return await this.bucketRepository.getBucketStats(providerId, bucketName);
  }
}
