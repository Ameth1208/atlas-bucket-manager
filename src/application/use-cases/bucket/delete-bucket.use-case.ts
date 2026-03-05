import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';

export class DeleteBucketUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(providerId: string, bucketName: string): Promise<void> {
    await this.bucketRepository.deleteBucket(providerId, bucketName);
  }
}
