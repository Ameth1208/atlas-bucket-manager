import { IBucketRepository } from '../../../domain/repositories/bucket.repository.interface';
import { SearchResult } from '../../../domain/entities/object.entity';

export class SearchObjectsUseCase {
  constructor(private bucketRepository: IBucketRepository) {}

  async execute(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return await this.bucketRepository.searchObjects(query);
  }
}
