import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';
import { ProviderInfo } from '../../../domain/entities/provider.entity';

export class GetProvidersUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  execute(): ProviderInfo[] {
    return this.bucketRepository.getActiveProviders();
  }
}
