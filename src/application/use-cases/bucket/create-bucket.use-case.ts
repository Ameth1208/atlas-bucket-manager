import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';
import { CreateBucketDto } from '../../dtos/create-bucket.dto';

export class CreateBucketUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(dto: CreateBucketDto): Promise<void> {
    if (!dto.providerId || !dto.name) {
      throw new Error('Provider ID and bucket name are required');
    }

    // Validar nombre del bucket (reglas S3)
    if (dto.name.length < 3 || dto.name.length > 63) {
      throw new Error('Bucket name must be between 3 and 63 characters');
    }

    if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(dto.name)) {
      throw new Error('Bucket name must follow S3 naming conventions');
    }

    await this.bucketRepository.createBucket(dto.providerId, dto.name);
  }
}
