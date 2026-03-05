import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';

export class UpdateBucketPolicyUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(providerId: string, bucketName: string, isPublic: boolean): Promise<void> {
    await this.bucketRepository.setBucketVisibility(providerId, bucketName, isPublic);
  }
}
