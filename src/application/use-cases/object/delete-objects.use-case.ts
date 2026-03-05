import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';

export class DeleteObjectsUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(providerId: string, bucketName: string, objectNames: string[]): Promise<void> {
    if (!Array.isArray(objectNames) || objectNames.length === 0) {
      throw new Error('Object names must be a non-empty array');
    }

    await this.bucketRepository.deleteObjects(providerId, bucketName, objectNames);
  }
}
