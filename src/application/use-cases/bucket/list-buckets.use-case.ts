import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';
import { Bucket } from '../../../domain/entities/bucket.entity';

export class ListBucketsUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(): Promise<Bucket[]> {
    return await this.bucketRepository.listBuckets();
  }
}
