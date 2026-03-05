import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';
import { StorageObject } from '../../../domain/entities/object.entity';

export class ListObjectsUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(providerId: string, bucketName: string, prefix?: string): Promise<StorageObject[]> {
    return await this.bucketRepository.listObjects(providerId, bucketName, prefix);
  }
}
