import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';

export class GetObjectStreamUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(providerId: string, bucketName: string, objectName: string): Promise<any> {
    if (!objectName) {
      throw new Error('Object name is required');
    }

    return await this.bucketRepository.getObjectStream(providerId, bucketName, objectName);
  }
}
