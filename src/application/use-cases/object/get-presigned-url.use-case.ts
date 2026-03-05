import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';

export class GetPresignedUrlUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(providerId: string, bucketName: string, objectName: string, expiry: number = 3600): Promise<string> {
    return await this.bucketRepository.getPresignedUrl(providerId, bucketName, objectName, expiry);
  }
}
